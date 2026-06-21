import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getNewsletters, completeOnboarding } from "@/services/onboarding"
import { sendersKeys, onboardingKeys } from "@/queries/keys"

// `enabled` lets callers run detection lazily (e.g. the Sources page only scans
// Gmail when the user clicks "Discover"). Onboarding leaves it on by default.
export function useNewslettersQuery(enabled = true) {
  return useQuery({
    queryKey: onboardingKeys.newsletters,
    queryFn: getNewsletters,
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: (failureCount, error) =>
      (error as { status?: number }).status === 409 ? false : failureCount < 1,
  })
}

export function useCompleteOnboardingMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: () => qc.invalidateQueries({ queryKey: sendersKeys.all }),
  })
}
