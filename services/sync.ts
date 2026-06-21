import { ApiClient } from "@/lib/api-client"

export class ReconnectRequiredError extends Error {
  status = 409
  constructor(message = "Reconnect Gmail to continue") {
    super(message)
    this.name = "ReconnectRequiredError"
  }
}

export async function runSync(): Promise<{ ok: true }> {
  const result = await ApiClient.post<{ ok: true }>("/sync")
  if (result.error) {
    if (result.error.status === 409) {
      throw new ReconnectRequiredError(result.error.message)
    }
    throw new Error(result.error.message)
  }
  return result.data
}
