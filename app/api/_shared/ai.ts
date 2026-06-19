import { generateObject } from "ai"
import { google } from "@ai-sdk/google"
import { anthropic } from "@ai-sdk/anthropic"

import { config } from "@/lib/config"
import { digestSummarySchema } from "@/shared/schemas/digest"
import type { DigestSummary } from "@/shared/types"

function model() {
  const id = config.ai.model
  return config.ai.provider === "anthropic" ? anthropic(id) : google(id)
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
