"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SaveButton({
  onSave,
  disabled,
  children = "Save",
  className,
}: {
  onSave: () => void | Promise<void>
  disabled?: boolean
  children?: React.ReactNode
  className?: string
}) {
  const [state, setState] = React.useState<"idle" | "saving" | "saved">("idle")
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  )

  React.useEffect(() => () => clearTimeout(timer.current), [])

  async function handle() {
    try {
      setState("saving")
      await onSave()
      setState("saved")
      timer.current = setTimeout(() => setState("idle"), 1600)
    } catch {
      setState("idle")
    }
  }

  return (
    <Button
      size="lg"
      onClick={handle}
      disabled={disabled || state === "saving"}
      data-state={state}
      className={cn(
        "min-w-24 transition-colors duration-300",
        state === "saved" &&
          "bg-(--toast-success)/15 text-(--toast-success) hover:bg-(--toast-success)/15",
        className
      )}
    >
      {state === "saving" ? (
        <span className="inline-flex items-center gap-2">
          <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Saving
        </span>
      ) : state === "saved" ? (
        <span className="inline-flex items-center gap-1.5">
          <HugeiconsIcon
            icon={Tick02Icon}
            strokeWidth={2.5}
            className="size-4"
          />
          Saved
        </span>
      ) : (
        children
      )}
    </Button>
  )
}
