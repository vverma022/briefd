import { ApiClient } from "@/lib/api-client"
import type { NewslettersResponse } from "@/shared/types"

export class ReconnectRequiredError extends Error {
  status = 409
  constructor(message = "Reconnect Gmail to continue") {
    super(message)
    this.name = "ReconnectRequiredError"
  }
}

export async function getNewsletters(): Promise<NewslettersResponse> {
  const result = await ApiClient.get<NewslettersResponse>(
    "/onboarding/newsletters"
  )
  if (result.error) {
    if (result.error.status === 409) {
      throw new ReconnectRequiredError(result.error.message)
    }
    throw new Error(result.error.message)
  }
  return result.data
}

export async function completeOnboarding(): Promise<{ ok: true }> {
  const result = await ApiClient.post<{ ok: true }>("/onboarding/complete")
  if (result.error) throw new Error(result.error.message)
  return result.data
}
