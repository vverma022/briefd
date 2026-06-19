import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

import { config } from "@/lib/config"
import { digestSummarySchema } from "@/shared/schemas/digest"
import type { DigestSummary, NewsletterCandidate } from "@/shared/types"

function model() {
  const id = config.ai.model
  return google(id)
}

export function isAIEnabled(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
}

export async function summarizeEmail(body: string): Promise<DigestSummary> {
  const { object } = await generateObject({
    model: model(),
    schema: digestSummarySchema,
    schemaName: "NewsletterDigest",
    schemaDescription: "A faithful, structured digest of a newsletter email.",
    system:
      "You summarize newsletter emails into a structured digest. Be faithful, " +
      "concise, and concrete. Never invent facts not present in the email.",
    prompt: body.slice(0, 24_000),
  })
  return object
}

export const NEWSLETTER_CATEGORIES = [
  "News & Politics",
  "Tech & Engineering",
  "Business & Finance",
  "Productivity & Career",
  "Design & Creative",
  "Science & Health",
  "Marketing & Growth",
  "Lifestyle & Culture",
  "Community & Forums",
  "Other",
] as const

export type OrganizedSender = {
  senderEmail: string
  category: string
  isNoise: boolean
}

const organizeResultSchema = z.object({
  senders: z.array(
    z.object({
      senderEmail: z.string(),
      category: z.string(),
      isNoise: z.boolean(),
    })
  ),
})

type SenderToOrganize = Pick<
  NewsletterCandidate,
  "senderEmail" | "senderName" | "count"
>

async function organizeBatch(
  batch: SenderToOrganize[]
): Promise<OrganizedSender[]> {
  const list = batch
    .map(
      (c) =>
        `- ${c.senderEmail}${c.senderName ? ` (${c.senderName})` : ""} — ${c.count} emails`
    )
    .join("\n")

  const { object } = await generateObject({
    model: model(),
    schema: organizeResultSchema,
    schemaName: "OrganizedNewsletters",
    schemaDescription:
      "Classification of email senders into a reading category and a noise flag.",
    system:
      "You help a reader curate which senders to summarize. For each sender:\n" +
      `- Assign a "category" — prefer one of: ${NEWSLETTER_CATEGORIES.join(", ")}. Coin a short new one only if none fit.\n` +
      '- Set "isNoise" to true for automated, transactional, or notification mail nobody reads for pleasure: ' +
      "social network notifications (LinkedIn/X/Facebook alerts, connection requests), job alerts, " +
      "security/sign-in alerts, order receipts & shipping, calendar invites, password resets, billing, " +
      "and other system-generated mail. Set isNoise to false for genuine editorial newsletters, digests, " +
      "and publications a person reads for content.\n" +
      "Return exactly one entry per sender, echoing the senderEmail verbatim.",
    prompt: `Classify these senders:\n${list}`,
  })
  return object.senders
}

export async function organizeNewsletters(
  candidates: SenderToOrganize[]
): Promise<Map<string, OrganizedSender>> {
  const result = new Map<string, OrganizedSender>()
  if (!isAIEnabled() || candidates.length === 0) return result

  const BATCH_SIZE = 80
  const batches: SenderToOrganize[][] = []
  for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
    batches.push(candidates.slice(i, i + BATCH_SIZE))
  }

  const settled = await Promise.allSettled(batches.map(organizeBatch))
  for (const s of settled) {
    if (s.status !== "fulfilled") continue
    for (const entry of s.value) {
      result.set(entry.senderEmail.trim().toLowerCase(), entry)
    }
  }
  return result
}
