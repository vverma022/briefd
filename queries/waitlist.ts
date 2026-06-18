import { useMutation } from "@tanstack/react-query"

import { joinWaitlist } from "@/services/waitlist"
import { notify } from "@/lib/toast"
import type { JoinWaitlistInput } from "@/shared/types"

export function useJoinWaitlistMutation() {
  return useMutation({
    mutationFn: (input: JoinWaitlistInput) => joinWaitlist(input),
    onSuccess: (result) => {
      // Duplicate signup — surface a toast (the "joined" case is reflected in
      // the form's confirmation view via the mutation's data/state).
      if (result.status === "already") {
        notify.warning(
          "You're already on the waitlist",
          "We'll email you the moment early access opens."
        )
      }
    },
    onError: (error) =>
      notify.error(
        "Something went wrong",
        error instanceof Error ? error.message : "Please try again."
      ),
  })
}
