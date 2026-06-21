import { z } from "zod"

export const digestSummarySchema = z.object({
  title: z
    .string()
    .describe("Clean, descriptive title — not the click-baity email subject"),
  tldr: z.string().describe("2-3 sentence plain-English summary"),
  takeaways: z
    .array(z.string())
    .min(1)
    .max(5)
    .describe("3-5 concrete, specific takeaways"),
  readingTimeMinutes: z.number().int().min(1).max(60),
  tone: z
    .string()
    .describe("one word, e.g. motivational / analytical / narrative / how-to"),
})

// A persisted digest serialized for the wire. Prisma Date fields are ISO strings
// over JSON, so receivedAt/createdAt are strings. rawText is intentionally NEVER
// part of any client shape (large; only the AI summarizer reads it).
export const digestSchema = z.object({
  id: z.string(),
  senderEmail: z.string(),
  senderName: z.string().nullable(),
  subject: z.string(),
  receivedAt: z.string(),
  createdAt: z.string(),
  summary: digestSummarySchema.nullable(),
  summarizationPending: z.boolean(),
  isRead: z.boolean(),
  isSaved: z.boolean(),
  gmailMessageId: z.string(),
  gmailThreadId: z.string().nullable(),
})

export const digestListResponseSchema = z.object({
  items: z.array(digestSchema),
  nextCursor: z.string().nullable(),
})

export const updateDigestSchema = z.object({
  isRead: z.boolean().optional(),
  isSaved: z.boolean().optional(),
})
