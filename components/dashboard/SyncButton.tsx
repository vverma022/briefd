"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useSyncMutation } from "@/queries/sync"
import { ReconnectRequiredError } from "@/services/sync"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

export function SyncButton() {
  const sync = useSyncMutation()

  function onSync() {
    sync.mutate(undefined, {
      onSuccess: () => notify.success("Sync started", "Fetching new briefs…"),
      onError: (e) =>
        e instanceof ReconnectRequiredError
          ? notify.warning("Reconnect Gmail", e.message)
          : notify.error(
              "Sync failed",
              e instanceof Error ? e.message : undefined
            ),
    })
  }

  return (
    <SidebarMenuButton
      onClick={onSync}
      disabled={sync.isPending}
      tooltip="Sync now"
    >
      <HugeiconsIcon
        icon={RefreshIcon}
        strokeWidth={1.5}
        className={cn(sync.isPending && "animate-spin")}
      />
      <span>{sync.isPending ? "Syncing…" : "Sync now"}</span>
    </SidebarMenuButton>
  )
}
