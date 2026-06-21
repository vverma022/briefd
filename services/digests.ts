import { ApiClient } from "@/lib/api-client"
import type {
  Digest,
  DigestListResponse,
  UpdateDigestInput,
} from "@/shared/types"

export type DigestListParams = {
  isRead?: boolean
  isSaved?: boolean
  senderEmail?: string
  cursor?: string
  limit?: number
}

export async function getDigests(
  params: DigestListParams = {}
): Promise<DigestListResponse> {
  const result = await ApiClient.get<DigestListResponse>("/digests", params)
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export async function getDigest(id: string): Promise<Digest> {
  const result = await ApiClient.get<Digest>(`/digests/${id}`)
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export async function updateDigest(
  id: string,
  input: UpdateDigestInput
): Promise<{ ok: true }> {
  const result = await ApiClient.patch<{ ok: true }, UpdateDigestInput>(
    `/digests/${id}`,
    input
  )
  if (result.error) throw new Error(result.error.message)
  return result.data
}
