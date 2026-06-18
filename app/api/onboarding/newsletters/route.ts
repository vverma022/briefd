import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { gmail_v1 } from "googleapis"

import {
  getValidGoogleAccessToken,
  NeedsReauthError,
} from "@/app/api/_shared/google"
import { gmailClient } from "@/app/api/_shared/gmail"
import type { NewsletterCandidate } from "@/shared/types"

export const runtime = "nodejs"
export const maxDuration = 60

function parseFrom(value: string): { email: string; name: string | null } {
  const match = value.match(/<([^>]+)>/)
  const email = (match ? match[1] : value).trim().toLowerCase()
  let name: string | null = null
  if (match) {
    name = value.slice(0, match.index).trim().replace(/^"|"$/g, "") || null
  }
  return { email, name }
}

async function runPool<T>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<void>
): Promise<void> {
  let i = 0
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (i < items.length) {
        const idx = i++
        try {
          await worker(items[idx])
        } catch {}
      }
    }
  )
  await Promise.all(runners)
}

function isNewsletterHeaders(headers: gmail_v1.Schema$MessagePartHeader[]) {
  const header = (name: string) =>
    headers.find((h) => h.name?.toLowerCase() === name)?.value ?? undefined
  const precedence = header("precedence")?.toLowerCase()
  return Boolean(
    header("list-unsubscribe") ||
    header("list-id") ||
    precedence === "bulk" ||
    precedence === "list"
  )
}

async function detectNewsletters(
  accessToken: string,
  watchedEmails: Set<string>
): Promise<NewsletterCandidate[]> {
  const gmail = gmailClient(accessToken)
  const LOOKBACK_DAYS = 90
  const MAX_MESSAGES = 250
  const PAGE_SIZE = 100
  const METADATA_CONCURRENCY = 10
  const query =
    `newer_than:${LOOKBACK_DAYS}d ` +
    "(category:promotions OR category:updates OR category:forums OR unsubscribe)"

  const ids: string[] = []
  let pageToken: string | undefined
  do {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: query,
      maxResults: Math.min(PAGE_SIZE, MAX_MESSAGES - ids.length),
      pageToken,
    })
    for (const m of res.data.messages ?? []) if (m.id) ids.push(m.id)
    pageToken = res.data.nextPageToken ?? undefined
  } while (pageToken && ids.length < MAX_MESSAGES)

  type Agg = { count: number; name: string | null; isNewsletter: boolean }
  const bySender = new Map<string, Agg>()

  await runPool(ids, METADATA_CONCURRENCY, async (id) => {
    const res = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "metadata",
      metadataHeaders: ["From", "List-Unsubscribe", "List-Id", "Precedence"],
    })
    const headers = res.data.payload?.headers ?? []
    const from = headers.find((h) => h.name?.toLowerCase() === "from")?.value
    if (!from) return
    const { email, name } = parseFrom(from)
    if (!email) return
    const cur = bySender.get(email) ?? {
      count: 0,
      name: null,
      isNewsletter: false,
    }
    cur.count += 1
    if (!cur.name && name) cur.name = name
    if (isNewsletterHeaders(headers)) cur.isNewsletter = true
    bySender.set(email, cur)
  })

  return [...bySender.entries()]
    .filter(([, v]) => v.isNewsletter)
    .map(([senderEmail, v]) => ({
      senderEmail,
      senderName: v.name,
      count: v.count,
      alreadyWatched: watchedEmails.has(senderEmail),
    }))
    .sort((a, b) => b.count - a.count)
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  try {
    const token = await getValidGoogleAccessToken(userId)
    const watched = await prisma.watchedSender.findMany({
      where: { userId },
      select: { senderEmail: true },
    })
    const watchedEmails = new Set(watched.map((w) => w.senderEmail))
    const candidates = await detectNewsletters(token, watchedEmails)
    return Response.json({ candidates })
  } catch (e) {
    if (e instanceof NeedsReauthError) {
      return Response.json(
        { error: "reconnect", message: "Reconnect Gmail to continue" },
        { status: 409 }
      )
    }
    throw e
  }
}
