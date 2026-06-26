import { z } from "zod"

export const featureRequestSchema = z.object({
  title: z.string().trim().min(3, "Give it a short title").max(120),
  description: z
    .string()
    .trim()
    .min(10, "Tell us a little more")
    .max(2000, "Keep it under 2000 characters"),
})
