"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// A themed, self-advancing loader for multi-step async work where we can't get
// real progress (e.g. a single request that fans out server-side). It walks
// through `stages` on a timer and parks on the last one until unmounted.
//
// Usage:
//   <StagedLoader stages={["Connecting", "Scanning", "Grouping"]} />
export function StagedLoader({
  stages,
  intervalMs = 2000,
  className,
}: {
  stages: string[]
  intervalMs?: number
  className?: string
}) {
  const [index, setIndex] = React.useState(0)
  const last = stages.length - 1

  React.useEffect(() => {
    if (index >= last) return
    const t = setTimeout(
      () => setIndex((i) => Math.min(i + 1, last)),
      intervalMs
    )
    return () => clearTimeout(t)
  }, [index, last, intervalMs])

  if (stages.length === 0) return null

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-6 py-16 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <div className="relative size-11">
        <div className="absolute inset-0 rounded-full border-2 border-foreground/10" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-foreground/60" />
      </div>

      {/* key re-triggers the entrance animation on each stage change */}
      <span
        key={index}
        className="animate-slide-up font-mono text-xs tracking-[0.3em] text-foreground/70 uppercase"
      >
        {stages[index]}
        <span className="loading-dots" aria-hidden>
          <span />
          <span />
          <span />
        </span>
      </span>

      <div className="flex items-center gap-1.5">
        {stages.map((stage, i) => (
          <span
            key={stage}
            className={cn(
              "size-1.5 rounded-full transition-colors duration-500",
              i <= index ? "bg-foreground/55" : "bg-foreground/15"
            )}
          />
        ))}
      </div>
    </div>
  )
}
