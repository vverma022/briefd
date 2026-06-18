import { z } from "zod"

// POST /api/waitlist — a single email joining the launch waitlist.
export const joinWaitlistSchema = z.object({
  email: z.string().email(),
})

// Response shape: "joined" for a fresh signup (confirmation email sent),
// "already" when the email is already on the list (no email, just a toast).
export const joinWaitlistResponseSchema = z.object({
  status: z.enum(["joined", "already"]),
})
