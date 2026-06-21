import type { ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: IconSvgElement
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-foreground/15 px-6 py-16 text-center">
      <HugeiconsIcon
        icon={icon}
        size={28}
        strokeWidth={1.5}
        className="text-foreground/40"
      />
      <div className="flex flex-col gap-1.5">
        <h3 className="font-serif text-2xl text-foreground italic">{title}</h3>
        <p className="mx-auto max-w-sm font-sans text-sm leading-relaxed font-light text-foreground/55">
          {description}
        </p>
      </div>
      {action}
    </div>
  )
}
