import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"
import { google, gmail_v1 } from "googleapis"
import type { NewsletterCandidate } from "@/shared/types"

export const runtime = "nodejs"
export const maxDuration = 60

class NeedsReauthError extends Error {
  constructor(message = "Gmail reconnect required") {
    super(message)
    this.name = "NeedsReauthError"
  }
}

// Read the Google access token from the accounts row, refreshing it against
// Google's token endpoint when it's within ~60s of expiry. expires_at is epoch
// seconds (Google + Auth.js convention).
async function getValidGoogleAccessToken(userId: string): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  })
  if (!account?.refresh_token) {
    throw new NeedsReauthError("No Google refresh token on file")
  }

  const expiresAtMs = (account.expires_at ?? 0) * 1000
  if (account.access_token && expiresAtMs > Date.now() + 60_000) {
    return account.access_token
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.auth.google.id ?? "",
      client_secret: config.auth.google.secret ?? "",
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  })
  const data = (await res.json()) as {
    access_token?: string
    expires_in?: number
    refresh_token?: string
    error?: string
  }
  if (!res.ok || !data.access_token) {
    // invalid_grant => refresh token revoked; user must reconnect Gmail.
    throw new NeedsReauthError(data.error ?? "Token refresh failed")
  }

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      expires_at: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
      ...(data.refresh_token ? { refresh_token: data.refresh_token } : {}),
    },
  })
  return data.access_token
}

function gmailClient(accessToken: string): gmail_v1.Gmail {
  const oauth2 = new google.auth.OAuth2()
  oauth2.setCredentials({ access_token: accessToken })
  return google.gmail({ version: "v1", auth: oauth2 })
}

// `"Acme" <news@acme.com>` | `news@acme.com` | `<news@acme.com>`
function parseFrom(value: string): { email: string; name: string | null } {
  const match = value.match(/<([^>]+)>/)
  const email = (match ? match[1] : value).trim().toLowerCase()
  let name: string | null = null
  if (match) {
    name = value.slice(0, match.index).trim().replace(/^"|"$/g, "") || null
  }
  return { email, name }
}

// Minimal bounded-concurrency worker pool (no extra dep).
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
        } catch {
          // Skip individual message failures (deleted/permission) — don't abort.
        }
      }
    }
  )
  await Promise.all(runners)
}

// Narrow to newsletter-ish mail by Gmail category, then confirm each sender via
// the List-Unsubscribe header. Ranked by frequency. Fetches metadata only.
async function detectNewsletters(
  accessToken: string,
  watchedEmails: Set<string>
): Promise<NewsletterCandidate[]> {
  const gmail = gmailClient(accessToken)
  const DETECTION_QUERY =
    "category:promotions OR category:updates OR category:forums"
  const LOOKBACK_DAYS = 90
  const MAX_MESSAGES = 150
  const PAGE_SIZE = 100
  const METADATA_CONCURRENCY = 8

  const ids: string[] = []
  let pageToken: string | undefined
  do {
    const res = await gmail.users.messages.list({
      userId: "me",
      q: `(${DETECTION_QUERY}) newer_than:${LOOKBACK_DAYS}d`,
      maxResults: Math.min(PAGE_SIZE, MAX_MESSAGES - ids.length),
      pageToken,
    })
    for (const m of res.data.messages ?? []) if (m.id) ids.push(m.id)
    pageToken = res.data.nextPageToken ?? undefined
  } while (pageToken && ids.length < MAX_MESSAGES)

  type Agg = { count: number; name: string | null; hasUnsub: boolean }
  const bySender = new Map<string, Agg>()

  await runPool(ids, METADATA_CONCURRENCY, async (id) => {
    const res = await gmail.users.messages.get({
      userId: "me",
      id,
      format: "metadata",
      metadataHeaders: ["From", "List-Unsubscribe"],
    })
    const headers = res.data.payload?.headers ?? []
    const from = headers.find((h) => h.name === "From")?.value
    if (!from) return
    const hasUnsub = headers.some((h) => h.name === "List-Unsubscribe")
    const { email, name } = parseFrom(from)
    if (!email) return
    const cur = bySender.get(email) ?? { count: 0, name: null, hasUnsub: false }
    cur.count += 1
    if (!cur.name && name) cur.name = name
    if (hasUnsub) cur.hasUnsub = true
    bySender.set(email, cur)
  })

  return [...bySender.entries()]
    .filter(([, v]) => v.hasUnsub)
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
