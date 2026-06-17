import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getNewsletters, completeOnboarding } from "@/services/onboarding"
import { sendersKeys, onboardingKeys } from "@/queries/keys"

export function useNewslettersQuery() {
  return useQuery({
    queryKey: onboardingKeys.newsletters,
    queryFn: getNewsletters,
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
