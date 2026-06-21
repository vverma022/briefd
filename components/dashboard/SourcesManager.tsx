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
import { DiscoverSources } from "@/components/dashboard/DiscoverSources"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
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

  const list = senders ?? []

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
          Watching {list.length > 0 ? `· ${list.length}` : ""}
        </h2>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : list.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-foreground/15 px-6 py-10 text-center font-sans text-sm text-foreground/55">
            No sources yet — add a newsletter below or discover them from Gmail.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {list.map((s) => (
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
                <ConfirmDialog
                  title="Remove this source?"
                  description={`Briefd will stop summarizing new emails from ${
                    s.senderName ?? s.senderEmail
                  }. Existing briefs stay in your dashboard.`}
                  confirmLabel="Remove"
                  destructive
                  onConfirm={() =>
                    new Promise<void>((resolve, reject) =>
                      remove.mutate(s.id, {
                        onSuccess: () => resolve(),
                        onError: (e) => {
                          notify.error(
                            "Couldn't remove source",
                            e instanceof Error ? e.message : undefined
                          )
                          reject(e)
                        },
                      })
                    )
                  }
                >
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-foreground/55 hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Remove source"
                  >
                    <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.5} />
                  </Button>
                </ConfirmDialog>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
          Add a source
        </h2>
        <ManualAddForm onAdd={onAdd} />
        <DiscoverSources />
      </section>
    </div>
  )
}
