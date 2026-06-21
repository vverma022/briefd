import { ApiClient } from "@/lib/api-client"
import type { UpdateProfileInput, UserProfile } from "@/shared/types"

export async function getProfile(): Promise<UserProfile> {
  const result = await ApiClient.get<UserProfile>("/profile")
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export async function updateProfile(
  input: UpdateProfileInput
): Promise<UserProfile> {
  const result = await ApiClient.patch<UserProfile, UpdateProfileInput>(
    "/profile",
    input
  )
  if (result.error) throw new Error(result.error.message)
  return result.data
}
