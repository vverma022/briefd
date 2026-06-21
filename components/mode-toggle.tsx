"use client"

import { useTheme } from "@/components/theme-provider"
import { HugeiconsIcon } from "@hugeicons/react"
import { Moon02Icon, Sun01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const options = [
  { value: "light", label: "Light", icon: Sun01Icon },
  { value: "dark", label: "Dark", icon: Moon02Icon },
] as const

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Toggle theme"
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
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="min-w-32 rounded-xl"
      >
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value)}
            data-active={theme === option.value}
            className="rounded-lg font-mono text-[11px] tracking-[0.2em] uppercase data-[active=true]:bg-accent data-[active=true]:text-foreground"
          >
            <HugeiconsIcon
              icon={option.icon}
              className="size-4"
              strokeWidth={1.5}
            />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
