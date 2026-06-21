"use client"

import * as React from "react"
import { useTheme } from "@/components/theme-provider"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

// A single click toggles the theme. When the browser supports the View
// Transitions API (and the user hasn't asked for reduced motion), the new theme
// is revealed with a clip-path circle that expands from the button — otherwise it
// flips instantly. Either way the sun/moon icon morphs via the `.dark` class.
export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = resolvedTheme === "dark" ? "light" : "dark"

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    // setTheme applies the change synchronously, which is what the transition
    // callback needs in order to snapshot the new state.
    if (!document.startViewTransition || prefersReducedMotion) {
      setTheme(next)
      return
    }

    // Reveal origin = the button's center.
    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    const transition = document.startViewTransition(() => setTheme(next))
    transition.ready
      .then(() =>
        document.documentElement.animate(
          {
            clipPath: [
              `circle(0px at ${x}px ${y}px)`,
              `circle(${endRadius}px at ${x}px ${y}px)`,
            ],
          },
          {
            duration: 500,
            easing: "cubic-bezier(0.16,1,0.3,1)",
            pseudoElement: "::view-transition-new(root)",
          }
        )
      )
      .catch(() => {
        /* transition skipped — theme is already applied */
      })
  }

  return (
    <Button
      variant="outline"
      size="icon"
      aria-label="Toggle theme"
      onClick={toggle}
      className="relative size-9 rounded-full border-foreground/10 bg-foreground/5 hover:bg-foreground/10"
    >
      <HugeiconsIcon
        icon={Sun01Icon}
        className="size-4 scale-100 rotate-0 transition-all duration-500 dark:scale-0 dark:-rotate-90"
        strokeWidth={1.5}
      />
      <HugeiconsIcon
        icon={Moon02Icon}
        className="absolute size-4 scale-0 rotate-90 transition-all duration-500 dark:scale-100 dark:rotate-0"
        strokeWidth={1.5}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
