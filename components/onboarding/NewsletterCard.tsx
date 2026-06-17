"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import type { NewsletterCandidate } from "@/shared/types"

export function NewsletterCard({
  candidate,
  checked,
  disabled,
  onToggle,
}: {
  candidate: NewsletterCandidate
  checked: boolean
  disabled?: boolean
  onToggle: (checked: boolean) => void
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-2xl border border-foreground/10 bg-foreground/[0.02] px-5 py-4 transition-colors hover:border-foreground/20",
        checked && "border-foreground/25 bg-foreground/5",
        disabled && "cursor-default opacity-70 hover:border-foreground/10"
      )}
    >
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onToggle(value === true)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-sans text-sm font-medium text-foreground">
          {candidate.senderName ?? candidate.senderEmail}
        </span>
        <span className="truncate font-mono text-[11px] tracking-wide text-foreground/45">
          {candidate.senderEmail}
        </span>
      </div>
      {disabled ? (
        <span className="shrink-0 font-mono text-[9px] tracking-[0.25em] text-foreground/40 uppercase">
          Added
        </span>
      ) : (
        <span className="shrink-0 rounded-full border border-foreground/10 px-2.5 py-1 font-mono text-[10px] tracking-[0.2em] text-foreground/50 uppercase">
          {candidate.count} {candidate.count === 1 ? "email" : "emails"}
        </span>
      )}
    </label>
  )
}
