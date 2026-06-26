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
import type {
  digestSummarySchema,
  digestSchema,
  digestListResponseSchema,
  updateDigestSchema,
} from "@/shared/schemas/digest"
import type {
  userProfileSchema,
  updateProfileSchema,
} from "@/shared/schemas/profile"
import type {
  joinWaitlistSchema,
  joinWaitlistResponseSchema,
} from "@/shared/schemas/waitlist"
import type { featureRequestSchema } from "@/shared/schemas/feature-request"

export type SenderInput = z.infer<typeof senderInputSchema>
export type AddSendersInput = z.infer<typeof addSendersSchema>
export type UpdateSenderInput = z.infer<typeof updateSenderSchema>
export type NewsletterCandidate = z.infer<typeof newsletterCandidateSchema>
export type NewslettersResponse = z.infer<typeof newslettersResponseSchema>
export type WatchedSender = z.infer<typeof watchedSenderSchema>
export type DigestSummary = z.infer<typeof digestSummarySchema>
export type Digest = z.infer<typeof digestSchema>
export type DigestListResponse = z.infer<typeof digestListResponseSchema>
export type UpdateDigestInput = z.infer<typeof updateDigestSchema>
export type UserProfile = z.infer<typeof userProfileSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type JoinWaitlistInput = z.infer<typeof joinWaitlistSchema>
export type JoinWaitlistResponse = z.infer<typeof joinWaitlistResponseSchema>
export type FeatureRequestInput = z.infer<typeof featureRequestSchema>
