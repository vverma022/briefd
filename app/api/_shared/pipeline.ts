import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import { decrypt } from "@/lib/crypto"
import { getValidGoogleAccessToken } from "./google"
import { listSenderMessageIds, getMessage } from "./gmail"
import { summarizeEmail, type AiPrefs, type SummaryLength } from "./ai"

const BATCH = 5
const LOOKBACK_DAYS = 14
const SUMMARIZE_LIMIT = 10

function isDuplicateKey(e: unknown): boolean {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
}

// Fetch new messages from one sender (after the stored cursor) and insert them
// as pending digests. Two-layer idempotency: the unique {userId, gmailMessageId}
// index is the hard guarantee; the cursor just avoids re-fetching old mail.
async function syncSender(
  userId: string,
  accessToken: string,
  senderEmail: string
) {
  const cursor = await prisma.syncCursor.findUnique({
    where: { userId_senderEmail: { userId, senderEmail } },
  })
  const lastMs = cursor?.lastInternalDate?.getTime() ?? 0
  const afterSec = Math.floor(
    (lastMs || Date.now() - LOOKBACK_DAYS * 864e5) / 1000
  )

  const ids = await listSenderMessageIds(
    accessToken,
    senderEmail,
    afterSec,
    BATCH
  )
  let newestMs = lastMs

  for (const id of ids) {
    const msg = await getMessage(accessToken, id)
    if (msg.internalDate <= lastMs) continue
    try {
      await prisma.digest.create({
        data: {
          userId,
          senderEmail,
          gmailMessageId: msg.gmailMessageId,
          gmailThreadId: msg.gmailThreadId,
          subject: msg.subject,
          receivedAt: new Date(msg.internalDate),
          rawText: msg.rawText,
        },
      })
    } catch (e) {
      if (isDuplicateKey(e)) continue // already processed
      throw e
    }
    newestMs = Math.max(newestMs, msg.internalDate)
  }

  if (newestMs > lastMs) {
    await prisma.syncCursor.upsert({
      where: { userId_senderEmail: { userId, senderEmail } },
      create: { userId, senderEmail, lastInternalDate: new Date(newestMs) },
      update: { lastInternalDate: new Date(newestMs) },
    })
  }
}

// Resolve a user's summarization preferences (length + BYOK provider/key) once
// per run. A decryption failure (e.g. ENCRYPTION_KEY was rotated) falls back to
// the app's default key — that's our bug to absorb, not the user's. A *provider*
// failure from a working-but-rejected key is handled at the call site (the
// digest stays pending) so we never silently burn the shared key for a user who
// set a broken custom key.
async function resolveAiPrefs(userId: string): Promise<AiPrefs> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      summaryLength: true,
      aiProvider: true,
      aiApiKeyCiphertext: true,
    },
  })
  const length = (u?.summaryLength as SummaryLength | undefined) ?? "standard"
  if (u && u.aiProvider !== "default" && u.aiApiKeyCiphertext) {
    try {
      return {
        provider: u.aiProvider as AiPrefs["provider"],
        apiKey: decrypt(u.aiApiKeyCiphertext),
        length,
      }
    } catch {
      // Unreadable ciphertext → fall through to the app default key.
    }
  }
  return { provider: "default", length }
}

// Drain pending digests through the AI summarizer. A failure leaves the digest
// pending (attempts incremented) so nothing is lost; the next run retries.
export async function summarizePending(
  userId: string,
  limit = SUMMARIZE_LIMIT
) {
  const pending = await prisma.digest.findMany({
    where: { userId, summarizationPending: true },
    orderBy: { createdAt: "asc" },
    take: limit,
  })
  if (pending.length === 0) return

  const prefs = await resolveAiPrefs(userId)

  for (const d of pending) {
    try {
      const summary = await summarizeEmail(d.rawText, prefs)
      await prisma.digest.update({
        where: { id: d.id },
        data: {
          summary: { set: summary },
          summarizationPending: false,
          summarizeAttempts: { increment: 1 },
        },
      })
    } catch {
      await prisma.digest.update({
        where: { id: d.id },
        data: { summarizeAttempts: { increment: 1 } },
      })
    }
  }
}

// Shared by /api/sync (one user) and /api/cron/run (all users). Throws
// NeedsReauthError if the user's Gmail token is unusable.
export async function syncUser(userId: string) {
  const token = await getValidGoogleAccessToken(userId)
  const senders = await prisma.watchedSender.findMany({
    where: { userId, isActive: true },
  })
  for (const s of senders) {
    try {
      await syncSender(userId, token, s.senderEmail)
    } catch {
      // one bad sender shouldn't abort the whole run
    }
  }
  await summarizePending(userId)
}
