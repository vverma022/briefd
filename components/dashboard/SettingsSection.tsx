"use client"

import * as React from "react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"

// A settings card that staggers in on mount, matching the app's editorial
// easing. Shared by the profile settings sections and the push settings card.
export function SettingsSection({
  index,
  className,
  children,
}: {
  index: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.07,
      }}
      className={cn(
        "flex flex-col gap-6 rounded-2xl border border-foreground/10 bg-foreground/2 p-6",
        className
      )}
    >
      {children}
    </motion.section>
  )
}
