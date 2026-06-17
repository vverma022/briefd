import Link from "next/link"

import { BriefdLogo } from "@/components/brand/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

const steps = [
  { n: 1, label: "Connect" },
  { n: 2, label: "Choose" },
]

export function OnboardingHeader({ step }: { step: number }) {
  return (
    <header className="relative z-50 mx-auto flex w-[92vw] items-center justify-between py-7">
      <Link href="/" aria-label="Briefd home" className="flex items-center">
        <BriefdLogo />
      </Link>

      <div className="hidden items-center gap-4 sm:flex">
        {steps.map((s) => (
          <span
            key={s.n}
            className={cn(
              "font-mono text-[10px] tracking-[0.3em] uppercase transition-colors",
              s.n === step ? "text-foreground" : "text-foreground/30"
            )}
          >
            {s.n} · {s.label}
          </span>
        ))}
      </div>

      <ModeToggle />
    </header>
  )
}
