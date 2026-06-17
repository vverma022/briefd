import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkBadge01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

export function OnboardingSuccess() {
  return (
    <div className="animate-slide-up flex flex-col items-center gap-8 py-10 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/5">
        <HugeiconsIcon
          icon={CheckmarkBadge01Icon}
          size={30}
          strokeWidth={1.5}
          className="text-foreground"
        />
      </div>
      <div className="flex flex-col gap-3">
        <h1 className="font-serif text-4xl text-foreground italic sm:text-5xl">
          You&apos;re all <span className="silver-text">set.</span>
        </h1>
        <p className="mx-auto max-w-md font-sans text-sm leading-relaxed font-light text-foreground/60">
          We&apos;ll start briefing your newsletters. You can manage your
          sources any time — your dashboard is coming soon.
        </p>
      </div>
      <Button asChild variant="silver" size="lg">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  )
}
