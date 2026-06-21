import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { Digest } from "@/shared/types"

// Client-facing fields — everything except the large `rawText`.
const digestSelect = {
  id: true,
  senderEmail: true,
  subject: true,
  receivedAt: true,
  createdAt: true,
  summary: true,
  summarizationPending: true,
  isRead: true,
  isSaved: true,
  gmailMessageId: true,
  gmailThreadId: true,
} satisfies Prisma.DigestSelect

type DigestRow = Prisma.DigestGetPayload<{ select: typeof digestSelect }>

function serializeDigest(row: DigestRow, senderName: string | null): Digest {
  return {
    id: row.id,
    senderEmail: row.senderEmail,
    senderName,
    subject: row.subject,
    receivedAt: row.receivedAt.toISOString(),
    createdAt: row.createdAt.toISOString(),
    summary: row.summary,
    summarizationPending: row.summarizationPending,
    isRead: row.isRead,
    isSaved: row.isSaved,
    gmailMessageId: row.gmailMessageId,
    gmailThreadId: row.gmailThreadId,
  }
}

// One query to map senderEmail -> friendly name (senderName lives on
// WatchedSender, not on Digest).
async function resolveSenderNames(
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

export type ListDigestsParams = {
  userId: string
  isRead?: boolean
  isSaved?: boolean
  senderEmail?: string
  cursor?: string
  limit: number
}

export async function listDigests(params: ListDigestsParams): Promise<{
  items: Digest[]
  nextCursor: string | null
}> {
  const { userId, isRead, isSaved, senderEmail, cursor, limit } = params
  const rows = await prisma.digest.findMany({
    where: {
      userId,
      ...(isRead !== undefined ? { isRead } : {}),
      ...(isSaved !== undefined ? { isSaved } : {}),
      ...(senderEmail ? { senderEmail } : {}),
    },
    orderBy: { createdAt: "desc" },
    select: digestSelect,
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  })

  const hasMore = rows.length > limit
  const page = hasMore ? rows.slice(0, limit) : rows
  const nameMap = await resolveSenderNames(
    userId,
    page.map((r) => r.senderEmail)
  )
  return {
    items: page.map((r) =>
      serializeDigest(r, nameMap.get(r.senderEmail) ?? null)
    ),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  }
}

export async function getDigestById(
  userId: string,
  id: string
): Promise<Digest | null> {
  const row = await prisma.digest.findFirst({
    where: { id, userId },
    select: digestSelect,
  })
  if (!row) return null
  const sender = await prisma.watchedSender.findFirst({
    where: { userId, senderEmail: row.senderEmail },
    select: { senderName: true },
  })
  return serializeDigest(row, sender?.senderName ?? null)
}
