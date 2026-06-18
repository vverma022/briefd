import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { BriefdLogo } from "@/components/brand/logo"
import { Footer } from "@/components/landing/Footer"

export function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string
  title: React.ReactNode
  intro?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <main className="relative min-h-svh overflow-x-hidden">
      <header className="relative z-50 mx-auto flex w-[92vw] items-center justify-between py-7">
        <Link href="/" aria-label="Briefd home" className="flex items-center">
          <BriefdLogo />
        </Link>
        <Link
          href="/"
          className="flex items-center gap-2 rounded-full border border-foreground/10 bg-foreground/5 px-5 py-2.5 font-mono text-[10px] tracking-[0.25em] text-foreground/60 uppercase transition-colors hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={1.5} />
          Back home
        </Link>
      </header>

      <section className="relative mx-auto w-[92vw] py-10 sm:py-14">
        <div className="frosted-glass pointer-events-none absolute inset-x-0 top-0 -z-10 h-full rounded-[2rem] opacity-30 md:rounded-[4rem]" />
        <div className="flex flex-col gap-6 px-2 py-8 sm:px-6 sm:py-12">
          <span className="font-mono text-[10px] tracking-[0.5em] text-foreground/40 uppercase">
            {eyebrow}
          </span>
          <h1
            className="max-w-3xl font-serif text-foreground italic"
            style={{
              fontSize: "clamp(34px, 6vw, 68px)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
            }}
          >
            {title}
          </h1>
          {intro ? (
            <p className="max-w-xl font-sans text-sm leading-relaxed font-light text-foreground/60 sm:text-base">
              {intro}
            </p>
          ) : null}
        </div>
      </section>

      <section className="relative z-10 mx-auto w-[92vw] py-8 sm:py-12">
        {children}
      </section>

      <Footer />
    </main>
  )
}
