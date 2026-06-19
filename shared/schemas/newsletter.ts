import { z } from "zod"

export const newsletterCandidateSchema = z.object({
  senderEmail: z.string(),
  senderName: z.string().nullable(),
  count: z.number().int(),
  alreadyWatched: z.boolean(),
  category: z.string(),
  isNoise: z.boolean(),
})

export const newslettersResponseSchema = z.object({
  candidates: z.array(newsletterCandidateSchema),
})
