import { ApiClient } from "@/lib/api-client"
import type {
  AddSendersInput,
  UpdateSenderInput,
  WatchedSender,
} from "@/shared/types"

export async function getSenders(): Promise<WatchedSender[]> {
  const result = await ApiClient.get<WatchedSender[]>("/senders")
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export async function addSenders(
  input: AddSendersInput
): Promise<WatchedSender[]> {
  const result = await ApiClient.post<WatchedSender[], AddSendersInput>(
    "/senders",
    input
  )
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export async function updateSender(
  id: string,
  input: UpdateSenderInput
): Promise<{ ok: true }> {
  const result = await ApiClient.patch<{ ok: true }, UpdateSenderInput>(
    `/senders/${id}`,
    input
  )
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export async function removeSender(id: string): Promise<{ ok: true }> {
  const result = await ApiClient.delete<{ ok: true }>(`/senders/${id}`)
  if (result.error) throw new Error(result.error.message)
  return result.data
}
