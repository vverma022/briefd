import { useMutation, useQueryClient } from "@tanstack/react-query"

import { runSync } from "@/services/sync"
import { digestKeys } from "@/queries/keys"

export function useSyncMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: runSync,
    onSuccess: () => qc.invalidateQueries({ queryKey: digestKeys.all }),
  })
}
