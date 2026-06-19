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
