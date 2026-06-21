import { z } from "zod"

// The user's account profile, serialized for the wire. name/email/image come
// from the Google sign-in; digest* are the email-digest delivery preferences.
export const userProfileSchema = z.object({
  name: z.string().nullable(),
  email: z.string().nullable(),
  image: z.string().nullable(),
  digestEmailEnabled: z.boolean(),
  digestDeliveryHour: z.number().int().min(0).max(23),
  digestTimezone: z.string().nullable(),
})

// Fields the user may edit. Everything optional so the client can PATCH a
// single field at a time. (email/image are read-only — sourced from Google.)
export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1, "Name can't be empty").max(80).optional(),
    digestEmailEnabled: z.boolean().optional(),
    digestDeliveryHour: z.number().int().min(0).max(23).optional(),
    digestTimezone: z.string().max(64).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Nothing to update")
