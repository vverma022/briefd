import { Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"
import type { UserProfile } from "@/shared/types"

// Account fields surfaced to the client. Email/image are read-only (Google);
// name + digest*/summaryLength/ai* are user-editable preferences.
// aiApiKeyCiphertext is selected ONLY to derive the `hasCustomKey` boolean — the
// ciphertext itself is never serialized to the client.
const profileSelect = {
  name: true,
  email: true,
  image: true,
  digestEmailEnabled: true,
  digestDeliveryHour: true,
  digestTimezone: true,
  summaryLength: true,
  aiProvider: true,
  aiApiKeyCiphertext: true,
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
    summaryLength: row.summaryLength as UserProfile["summaryLength"],
    aiProvider: row.aiProvider as UserProfile["aiProvider"],
    hasCustomKey: Boolean(row.aiApiKeyCiphertext),
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
