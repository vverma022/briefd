"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Delete02Icon } from "@hugeicons/core-free-icons"

import {
  useSendersQuery,
  useAddSendersMutation,
  useUpdateSenderMutation,
  useRemoveSenderMutation,
} from "@/queries/senders"
import { ManualAddForm } from "@/components/onboarding/ManualAddForm"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { notify } from "@/lib/toast"
import type { SenderInput } from "@/shared/types"

export function SourcesManager() {
  const { data: senders, isLoading } = useSendersQuery()
  const add = useAddSendersMutation()
  const toggle = useUpdateSenderMutation()
  const remove = useRemoveSenderMutation()

  function onAdd(sender: SenderInput) {
    add.mutate([sender], {
      onSuccess: () => notify.success("Source added", sender.senderEmail),
      onError: (e) =>
        notify.error(
          "Couldn't add",
          e instanceof Error ? e.message : undefined
        ),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <ManualAddForm onAdd={onAdd} />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      ) : (senders ?? []).length === 0 ? (
        <p className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center font-sans text-sm text-foreground/55">
          No sources yet — add a newsletter sender above.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {(senders ?? []).map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 rounded-2xl border border-foreground/10 px-4 py-3"
            >
              <Checkbox
                checked={s.isActive}
                onCheckedChange={(v) =>
                  toggle.mutate({ id: s.id, input: { isActive: v === true } })
                }
                aria-label="Active"
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-sm font-medium text-foreground">
                  {s.senderName ?? s.senderEmail}
                </span>
                <span className="truncate font-mono text-[11px] text-foreground/45">
                  {s.senderEmail}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => remove.mutate(s.id)}
                aria-label="Remove source"
              >
                <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
