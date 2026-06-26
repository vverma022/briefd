import { ApiClient } from "@/lib/api-client"

// The browser subscription serialized for the wire (sub.toJSON()).
export type SerializedSubscription = {
  endpoint: string
  keys: { p256dh: string; auth: string }
}

export async function subscribePush(
  subscription: SerializedSubscription
): Promise<void> {
  const result = await ApiClient.post<{ ok: true }, SerializedSubscription>(
    "/push/subscribe",
    subscription
  )
  if (result.error) throw new Error(result.error.message)
}

export async function unsubscribePush(endpoint: string): Promise<void> {
  const result = await ApiClient.post<{ ok: true }, { endpoint: string }>(
    "/push/unsubscribe",
    { endpoint }
  )
  if (result.error) throw new Error(result.error.message)
}

export async function sendTestPush(): Promise<void> {
  const result = await ApiClient.post<{ ok: true; sent: number }>("/push/test")
  if (result.error) throw new Error(result.error.message)
}
