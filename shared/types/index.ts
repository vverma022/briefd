// All shared types are INFERRED from the Zod schemas in "@/shared/schemas" so
// the validators are the single source of truth. Import from "@/shared/types".
import type { z } from "zod"
import type {
  senderInputSchema,
  addSendersSchema,
  updateSenderSchema,
} from "@/shared/schemas/sender"
import type {
  newsletterCandidateSchema,
  newslettersResponseSchema,
} from "@/shared/schemas/newsletter"
import type { watchedSenderSchema } from "@/shared/schemas/watched-sender"
import type { digestSummarySchema } from "@/shared/schemas/digest"

export type SenderInput = z.infer<typeof senderInputSchema>
export type AddSendersInput = z.infer<typeof addSendersSchema>
export type UpdateSenderInput = z.infer<typeof updateSenderSchema>
export type NewsletterCandidate = z.infer<typeof newsletterCandidateSchema>
export type NewslettersResponse = z.infer<typeof newslettersResponseSchema>
export type WatchedSender = z.infer<typeof watchedSenderSchema>
export type DigestSummary = z.infer<typeof digestSummarySchema>
