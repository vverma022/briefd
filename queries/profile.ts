import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getProfile, updateProfile } from "@/services/profile"
import { profileKeys } from "@/queries/keys"
import type { UpdateProfileInput, UserProfile } from "@/shared/types"

export function useProfileQuery(initial?: UserProfile) {
  return useQuery({
    queryKey: profileKeys.all,
    queryFn: getProfile,
    initialData: initial,
  })
}

export function useUpdateProfileMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (profile) => qc.setQueryData(profileKeys.all, profile),
  })
}
