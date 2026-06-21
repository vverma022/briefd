import { z } from "zod"

export const summaryLengthSchema = z.enum(["short", "standard", "detailed"])
export const aiProviderSchema = z.enum([
  "default",
  "google",
  "anthropic",
  "openai",
])

export const userProfileSchema = z.object({
  name: z.string().nullable(),
  email: z.string().nullable(),
  image: z.string().nullable(),
  digestEmailEnabled: z.boolean(),
  digestDeliveryHour: z.number().int().min(0).max(23),
  digestTimezone: z.string().nullable(),
  summaryLength: summaryLengthSchema,
  aiProvider: aiProviderSchema,
  hasCustomKey: z.boolean(),
})

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, "Name can't be empty").max(80).optional(),
    digestEmailEnabled: z.boolean().optional(),
    digestDeliveryHour: z.number().int().min(0).max(23).optional(),
    digestTimezone: z.string().max(64).optional(),
    summaryLength: summaryLengthSchema.optional(),
    aiProvider: aiProviderSchema.optional(),
    aiApiKey: z.string().trim().min(1).max(400).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Nothing to update")
