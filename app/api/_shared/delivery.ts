import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"
import { sendMail } from "@/lib/mailer"
import { digestEmail, type DigestEmailItem } from "@/lib/emails/digest"

// Most briefs we put in one email. Beyond this, the rest stay undelivered and
// roll into the next day's digest (rather than being dropped) — see below.
const DIGEST_MAX_ITEMS = 12

// Only deliver digests this recent. A generous bound so a long-pending item that
// finally summarizes still goes out once, while keeping the window query small.
const LOOKBACK_DAYS = 7

// Derive the user's local hour (0-23) and calendar-day key "YYYY-MM-DD" for a
// given instant, without a date library. The day key is the load-bearing piece
// of per-day idempotency: DST changes the UTC instant of a local hour but never
// which calendar date the wall clock reads, so two UTC hours that both map to
// the delivery hour on one local date collapse to the same key.
function localParts(
  instant: Date,
  tz: string
): { hour: number; dayKey: string } | null {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hour12: false,
    }).formatToParts(instant)
    const get = (t: Intl.DateTimeFormatPartTypes) =>
      parts.find((p) => p.type === t)?.value ?? ""
    let hour = parseInt(get("hour"), 10)
    if (hour === 24) hour = 0 // some engines emit "24" for midnight
    // Build the key from explicit parts so locale ordering can never reorder it.
    const dayKey = `${get("year")}-${get("month")}-${get("day")}`
    return { hour, dayKey }
  } catch {
    return null // invalid IANA tz → RangeError
  }
}

// e.g. "Friday, June 21" in the user's timezone.
function dateLabel(instant: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(instant)
  } catch {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    }).format(instant)
  }
}

const userSelect = {
  id: true,
  email: true,
  digestDeliveryHour: true,
  digestTimezone: true,
  lastDigestSentOn: true,
} satisfies Prisma.UserSelect

const digestSelect = {
  id: true,
  senderEmail: true,
  summary: true,
} satisfies Prisma.DigestSelect

type DueUser = Prisma.UserGetPayload<{ select: typeof userSelect }>

// senderName lives on WatchedSender, not Digest — one lookup to map emails.
async function senderNames(
  userId: string,
  emails: string[]
): Promise<Map<string, string | null>> {
  const unique = [...new Set(emails)]
  if (unique.length === 0) return new Map()
  const senders = await prisma.watchedSender.findMany({
    where: { userId, senderEmail: { in: unique } },
    select: { senderEmail: true, senderName: true },
  })
  return new Map(senders.map((s) => [s.senderEmail, s.senderName]))
}

async function deliverForUser(user: DueUser, now: Date): Promise<boolean> {
  if (!user.email) return false

  const tz = user.digestTimezone ?? "UTC"
  const lp = localParts(now, tz)
  if (!lp) return false // unusable tz → never send at the wrong hour
  if (lp.hour !== user.digestDeliveryHour) return false // not their hour
  if (user.lastDigestSentOn === lp.dayKey) return false // already sent today

  const where: Prisma.DigestWhereInput = {
    userId: user.id,
    summarizationPending: false,
    summary: { isSet: true },
    deliveredAt: null,
    receivedAt: { gte: new Date(now.getTime() - LOOKBACK_DAYS * 864e5) },
  }

  const rows = await prisma.digest.findMany({
    where,
    orderBy: { receivedAt: "desc" },
    select: digestSelect,
    take: DIGEST_MAX_ITEMS,
  })
  // Nothing to send: skip WITHOUT advancing the day key, so newsletters that
  // arrive later today still go out (today, once more are summarized) rather
  // than being stranded until tomorrow.
  if (rows.length === 0) return false

  const total = await prisma.digest.count({ where })
  const extraCount = Math.max(0, total - rows.length)

  const names = await senderNames(
    user.id,
    rows.map((r) => r.senderEmail)
  )
  const items: DigestEmailItem[] = rows.map((r) => ({
    senderName: names.get(r.senderEmail) ?? null,
    senderEmail: r.senderEmail,
    title: r.summary?.title ?? "Untitled",
    tldr: r.summary?.tldr ?? "",
    takeaways: r.summary?.takeaways ?? [],
  }))

  const dashboardUrl = `${config.site.url.replace(/\/$/, "")}/dashboard`
  const email = digestEmail({
    items,
    extraCount,
    dashboardUrl,
    dateLabel: dateLabel(now, tz),
  })

  await sendMail({ to: user.email, ...email })

  // Mark exactly the sent items delivered AND advance the day key together, so
  // we never advance the cadence guard without recording what went out (and
  // vice versa). Overflow items keep deliveredAt=null → next day's digest.
  await prisma.$transaction([
    prisma.digest.updateMany({
      where: { id: { in: rows.map((r) => r.id) } },
      data: { deliveredAt: now },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { lastDigestSentOn: lp.dayKey },
    }),
  ])

  return true
}

// Send the daily digest to every user whose chosen local delivery hour is now
// and who hasn't already received one today. Idempotent and safe to call every
// hour from any external scheduler. Resilient per-user: one failure never aborts
// the batch.
export async function deliverDueDigests(
  now: Date = new Date()
): Promise<{ delivered: number }> {
  const users = await prisma.user.findMany({
    where: { digestEmailEnabled: true },
    select: userSelect,
  })

  let delivered = 0
  for (const user of users) {
    try {
      if (await deliverForUser(user, now)) delivered++
    } catch {
      // A bad send (SMTP hiccup, etc.) leaves lastDigestSentOn untouched, so the
      // user is retried on the next hourly run.
    }
  }
  return { delivered }
}
