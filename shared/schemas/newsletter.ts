import { z } from "zod"

// One detected newsletter sender from GET /api/onboarding/newsletters.
export const newsletterCandidateSchema = z.object({
  senderEmail: z.string(),
  senderName: z.string().nullable(),
  count: z.number().int(),
  alreadyWatched: z.boolean(),
})

// Full response body — lets the UI parse/validate the fetch result.
export const newslettersResponseSchema = z.object({
  candidates: z.array(newsletterCandidateSchema),
})
