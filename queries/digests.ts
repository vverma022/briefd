import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import {
  getDigests,
  getDigest,
  updateDigest,
  type DigestListParams,
} from "@/services/digests"
import { digestKeys } from "@/queries/keys"
import type {
  Digest,
  DigestListResponse,
  UpdateDigestInput,
} from "@/shared/types"

export function useDigestsQuery(
  params: DigestListParams,
  initialData?: DigestListResponse
) {
  return useInfiniteQuery({
    queryKey: digestKeys.list(params),
    queryFn: ({ pageParam }) => getDigests({ ...params, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    retry: (n, e) =>
      (e as { status?: number }).status === 409 ? false : n < 1,
    ...(initialData
      ? { initialData: { pages: [initialData], pageParams: [undefined] } }
      : {}),
  })
}

export function useDigestQuery(id: string, initialData?: Digest) {
  return useQuery({
    queryKey: digestKeys.detail(id),
    queryFn: () => getDigest(id),
    initialData,
  })
}

export function useUpdateDigestMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateDigestInput }) =>
      updateDigest(id, input),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: digestKeys.lists() })
      qc.invalidateQueries({ queryKey: digestKeys.detail(id) })
    },
  })
}
