import { ApiClient } from "@/lib/api-client"
import type { JoinWaitlistInput, JoinWaitlistResponse } from "@/shared/types"

export async function joinWaitlist(
  input: JoinWaitlistInput
): Promise<JoinWaitlistResponse> {
  const result = await ApiClient.post<JoinWaitlistResponse, JoinWaitlistInput>(
    "/waitlist",
    input
  )
  if (result.error) throw new Error(result.error.message)
  return result.data
}
