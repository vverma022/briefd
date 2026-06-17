import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getSenders,
  addSenders,
  updateSender,
  removeSender,
} from "@/services/senders"
import { sendersKeys, onboardingKeys } from "@/queries/keys"
import type { AddSendersInput, UpdateSenderInput } from "@/shared/types"

export function useSendersQuery() {
  return useQuery({ queryKey: sendersKeys.all, queryFn: getSenders })
}

export function useAddSendersMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: AddSendersInput) => addSenders(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sendersKeys.all })
      qc.invalidateQueries({ queryKey: onboardingKeys.newsletters })
    },
  })
}

export function useUpdateSenderMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSenderInput }) =>
      updateSender(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: sendersKeys.all }),
  })
}

export function useRemoveSenderMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => removeSender(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: sendersKeys.all }),
  })
}
