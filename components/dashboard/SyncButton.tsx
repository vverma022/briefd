"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon, Tick02Icon } from "@hugeicons/core-free-icons"

import { SidebarMenuButton } from "@/components/ui/sidebar"
import { useSyncMutation } from "@/queries/sync"
import { ReconnectRequiredError } from "@/services/sync"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"

export function SyncButton() {
  const sync = useSyncMutation()
  const [done, setDone] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  React.useEffect(() => () => clearTimeout(timer.current), [])

  function onSync() {
    sync.mutate(undefined, {
      onSuccess: () => {
        notify.success("Sync started", "Fetching new briefs…")
        setDone(true)
        timer.current = setTimeout(() => setDone(false), 1800)
      },
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
        icon={done ? Tick02Icon : RefreshIcon}
        strokeWidth={done ? 2.5 : 1.5}
        className={cn(
          "transition-colors",
          sync.isPending && "animate-spin",
          done && "text-(--toast-success)"
        )}
      />
      <span className={cn(done && "text-(--toast-success)")}>
        {sync.isPending ? "Syncing…" : done ? "Synced" : "Sync now"}
      </span>
    </SidebarMenuButton>
  )
}
