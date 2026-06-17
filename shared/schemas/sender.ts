import { z } from "zod"

// A single watched-sender input — used by the manual-add form (zodResolver) and
// by bulk select during onboarding.
export const senderInputSchema = z.object({
  senderEmail: z.string().email(),
  senderName: z.string().min(1).optional(),
})

// POST /api/senders accepts one sender OR an array (bulk select from onboarding).
export const addSendersSchema = z.union([
  senderInputSchema,
  z.array(senderInputSchema).min(1),
])

// PATCH /api/senders/[id] — toggle the active state.
export const updateSenderSchema = z.object({
  isActive: z.boolean(),
})
