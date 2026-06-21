"use client"

import * as React from "react"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  BookOpen01Icon,
  Mail01Icon,
  Notification03Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

/** Gmail's signature red — the one pop of colour in an otherwise monochrome UI. */
const GMAIL_RED = "#EA4335"

type Node = {
  icon: IconSvgElement
  label: string
  sub: string
  accent?: boolean
}

const nodes: Node[] = [
  { icon: Mail01Icon, label: "Your inbox", sub: "Read-only", accent: true },
  { icon: SparklesIcon, label: "Claude AI", sub: "Summarize" },
  { icon: BookOpen01Icon, label: "The brief", sub: "3-line TL;DR" },
  { icon: Notification03Icon, label: "Your phone", sub: "Pushed" },
]

/** A red pulse travelling the rail — horizontal on desktop, vertical on mobile. */
function Pulse({ axis, delay = 0 }: { axis: "x" | "y"; delay?: number }) {
  const transition = {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay,
  }
  const style = {
    backgroundColor: GMAIL_RED,
    boxShadow: `0 0 10px 1px ${GMAIL_RED}`,
  }
  return axis === "x" ? (
    <motion.span
      className="absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={style}
      animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
      transition={transition}
    />
  ) : (
    <motion.span
      className="absolute left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={style}
      animate={{ top: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
      transition={transition}
    />
  )
}

export function FlowDiagram() {
  return (
    <div className="frosted-glass rounded-3xl p-8 sm:p-12">
      <div className="relative">
        {/* Rail through the icon centres — icons are size-20 (80px), so the
            line sits at 40px (top-10 / left-10) to pass dead-centre. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 right-6 left-6 hidden h-px bg-foreground/15 md:block"
        >
          <Pulse axis="x" />
          <Pulse axis="x" delay={1.5} />
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute top-10 bottom-10 left-10 w-px bg-foreground/15 md:hidden"
        >
          <Pulse axis="y" />
        </div>

        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:justify-between md:gap-4">
          {nodes.map((node, i) => (
            <motion.div
              key={node.label}
              className="flex items-center gap-4 md:flex-1 md:flex-col md:gap-3 md:text-center"
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.5,
                delay: i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div
                className="flex size-20 shrink-0 items-center justify-center rounded-2xl border border-foreground/10 bg-background"
                style={
                  node.accent ? { borderColor: `${GMAIL_RED}55` } : undefined
                }
              >
                <HugeiconsIcon
                  icon={node.icon}
                  size={26}
                  strokeWidth={1.5}
                  className={node.accent ? undefined : "text-foreground/70"}
                  style={node.accent ? { color: GMAIL_RED } : undefined}
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-[11px] tracking-wide text-foreground/80">
                  {node.label}
                </span>
                <span className="font-mono text-[8px] tracking-[0.3em] text-foreground/40 uppercase">
                  {node.sub}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
