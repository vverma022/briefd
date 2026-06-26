"use client"

import type { ReactNode } from "react"
import { motion } from "motion/react"
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-foreground/15 px-6 py-16 text-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
      >
        <HugeiconsIcon
          icon={icon}
          size={28}
          strokeWidth={1.5}
          className="text-foreground/40"
        />
      </motion.div>
      <div className="flex flex-col gap-1.5">
        <h3 className="font-serif text-2xl text-foreground italic">{title}</h3>
        <p className="mx-auto max-w-sm font-sans text-sm leading-relaxed font-light text-foreground/55">
          {description}
        </p>
      </div>
      {action}
    </motion.div>
  )
}
