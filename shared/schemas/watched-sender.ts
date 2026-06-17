import { z } from "zod"

// A persisted watched sender as returned by the API. Prisma Date fields are
// serialized to ISO strings over JSON, so createdAt/updatedAt are strings here.
export const watchedSenderSchema = z.object({
  id: z.string(),
  userId: z.string(),
  senderEmail: z.string(),
  senderName: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
