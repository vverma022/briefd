import { generateObject, generateText } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { createAnthropic } from "@ai-sdk/anthropic"
import { createOpenAI } from "@ai-sdk/openai"
import type { LanguageModel } from "ai"
import { z } from "zod"

import { config } from "@/lib/config"
import { digestSummarySchema } from "@/shared/schemas/digest"
import type { DigestSummary, NewsletterCandidate } from "@/shared/types"

// "default" = the app's own Gemini key (config). The rest are BYOK providers
// where the user supplies their own key.
export type AiProvider = "default" | "google" | "anthropic" | "openai"
export type SummaryLength = "short" | "standard" | "detailed"

export type AiPrefs = {
  provider: AiProvider
  apiKey?: string | null // already-decrypted plaintext; null → app default
  length?: SummaryLength
}

// The model is chosen by us, not the user — summarization is a light task, so
// each provider is pinned to its best inexpensive model. Users only bring a key.
const DEFAULT_MODELS: Record<Exclude<AiProvider, "default">, string> = {
  google: "gemini-2.5-flash",
  anthropic: "claude-haiku-4-5",
  openai: "gpt-4o-mini",
}

// Build a language model for the given prefs. "default" (or a missing key) uses
// the app's Gemini key — the original behavior. A BYOK provider builds a client
// scoped to the user's key so their usage is billed to them, always on that
// provider's pinned summarization model.
function buildModel(prefs: AiPrefs): LanguageModel {
  if (prefs.provider === "default" || !prefs.apiKey) {
    return createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    })(config.ai.model)
  }
  const id = DEFAULT_MODELS[prefs.provider]
  switch (prefs.provider) {
    case "google":
      return createGoogleGenerativeAI({ apiKey: prefs.apiKey })(id)
    case "anthropic":
      return createAnthropic({ apiKey: prefs.apiKey })(id)
    case "openai":
      return createOpenAI({ apiKey: prefs.apiKey })(id)
  }
}

export function isAIEnabled(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY)
}

const BASE_SYSTEM =
  "You summarize newsletter emails into a structured digest. Be faithful, " +
  "concise, and concrete. Never invent facts not present in the email."

// Length presets only change the prompt — the persisted DigestSummary shape is
// unchanged (its takeaways min/max already spans every preset), so the dashboard
// renders all of them identically; only the density differs.
const SYSTEM_BY_LENGTH: Record<SummaryLength, string> = {
  short:
    BASE_SYSTEM +
    " Keep it minimal: a single-sentence tldr and 1-2 sharp takeaways. " +
    "Favor brevity over completeness.",
  standard: BASE_SYSTEM + " Provide a 2-3 sentence tldr and 3-4 takeaways.",
  detailed:
    BASE_SYSTEM +
    " Be thorough: a 3-4 sentence tldr and 5 specific takeaways that cover " +
    "every major point in the email.",
}

export async function summarizeEmail(
  body: string,
  prefs: AiPrefs = { provider: "default" }
): Promise<DigestSummary> {
  const { object } = await generateObject({
    model: buildModel(prefs),
    schema: digestSummarySchema,
    schemaName: "NewsletterDigest",
    schemaDescription: "A faithful, structured digest of a newsletter email.",
    system: SYSTEM_BY_LENGTH[prefs.length ?? "standard"],
    prompt: body.slice(0, 24_000),
  })
  return object
}

// Cheap liveness check for a user-supplied key before we store it. A tiny
// generation that either succeeds (key works) or throws (bad key/quota), with a
// hard timeout so a hanging provider can't block the settings PATCH.
export async function validateAiKey(
  provider: Exclude<AiProvider, "default">,
  apiKey: string
): Promise<boolean> {
  try {
    const probe = generateText({
      model: buildModel({ provider, apiKey }),
      prompt: "ping",
      maxOutputTokens: 1,
    })
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("validation timed out")), 10_000)
    )
    await Promise.race([probe, timeout])
    return true
  } catch {
    return false
  }
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
    // Curation always uses the app's default key — never a user's BYOK key.
    model: buildModel({ provider: "default" }),
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
