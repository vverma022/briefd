import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { UserProfile } from "@/shared/types"

// Account fields surfaced to the client. Email/image are read-only (Google);
// name + digest* are user-editable preferences.
const profileSelect = {
  name: true,
  email: true,
  image: true,
  digestEmailEnabled: true,
  digestDeliveryHour: true,
  digestTimezone: true,
} satisfies Prisma.UserSelect

type ProfileRow = Prisma.UserGetPayload<{ select: typeof profileSelect }>

export function serializeUserProfile(row: ProfileRow): UserProfile {
  return {
    name: row.name,
    email: row.email,
    image: row.image,
    digestEmailEnabled: row.digestEmailEnabled,
    digestDeliveryHour: row.digestDeliveryHour,
    digestTimezone: row.digestTimezone,
  }
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  })
  return row ? serializeUserProfile(row) : null
}
