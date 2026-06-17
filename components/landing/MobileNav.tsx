"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  BookOpen01Icon,
  Home01Icon,
  Mail01Icon,
  SparklesIcon,
  StarIcon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { config } from "@/lib/config"

const items: { icon: IconSvgElement; label: string; href: string }[] = [
  { icon: Home01Icon, label: "Home", href: "#" },
  { icon: BookOpen01Icon, label: "How", href: "#features" },
  {
    icon: SparklesIcon,
    label: config.isDev ? "Start" : "Join",
    href: config.isDev ? "/onboarding" : "#join",
  },
  { icon: Mail01Icon, label: "Sources", href: "#sources" },
  { icon: StarIcon, label: "Reviews", href: "#reviews" },
]

export function MobileNav() {
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.8)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <nav
      className={cn(
        "mobile-nav-blur fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full px-2 py-2 transition-all duration-500 md:hidden",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-32 opacity-0"
      )}
      style={{ transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)" }}
    >
      {items.map((item) => {
        const primary = item.href === "/onboarding" || item.label === "Join"
        return (
          <a
            key={item.label}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 rounded-full px-3 py-2 transition-colors",
              primary
                ? "bg-foreground text-background"
                : "text-foreground/55 hover:text-foreground"
            )}
          >
            <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} />
            <span className="font-mono text-[8px] tracking-[0.2em] uppercase">
              {item.label}
            </span>
          </a>
        )
      })}
    </nav>
  )
}
