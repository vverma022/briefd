import { ApiClient } from "@/lib/api-client"
import type { FeatureRequestInput } from "@/shared/types"

export async function submitFeatureRequest(
  input: FeatureRequestInput
): Promise<void> {
  const result = await ApiClient.post<{ ok: true }, FeatureRequestInput>(
    "/feature-requests",
    input
  )
  if (result.error) throw new Error(result.error.message)
}
