import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"

import { LandingCta } from "@/components/landing/LandingCta"

const metadata = [
  { label: "Source", value: "Your Gmail inbox" },
  { label: "Engine", value: "Claude AI summaries" },
  { label: "Delivery", value: "Pushed when ready" },
]

export function Hero() {
  return (
    <section className="relative mx-auto w-[92vw] py-10 sm:py-16">
      {/* Faint frosted backdrop */}
      <div className="frosted-glass pointer-events-none absolute inset-x-0 top-0 -z-10 h-full rounded-[2rem] opacity-30 md:rounded-[4rem]" />

      <div className="flex flex-col items-center gap-10 px-4 py-10 text-center sm:py-16">
        <div className="animate-slide-up flex items-center gap-3 rounded-full border border-foreground/10 bg-foreground/5 px-5 py-2">
          <span className="size-1.5 rounded-full bg-foreground" />
          <span className="font-mono text-[10px] tracking-[0.4em] text-foreground/60 uppercase">
            PWA · Now accepting waitlist
          </span>
        </div>

        <h1
          className="animate-slide-up font-serif text-foreground italic"
          style={{
            fontSize: "clamp(34px, 7vw, 88px)",
            lineHeight: 0.9,
            letterSpacing: "-0.03em",
            animationDelay: "0.1s",
          }}
        >
          Stop reading newsletters.
          <br />
          <span className="silver-text">Start getting briefed.</span>
        </h1>

        <p
          className="animate-slide-up max-w-xl font-sans text-sm leading-relaxed font-light text-foreground/60 sm:text-base"
          style={{ animationDelay: "0.2s" }}
        >
          Connect Gmail, pick the newsletters that matter, and let AI turn every
          issue into a three-line brief — pushed to your phone the moment it
          lands. No inbox. No clutter.
        </p>

        {/* Metadata bar */}
        <div
          className="animate-slide-up grid w-full max-w-3xl grid-cols-1 divide-y divide-foreground/10 border-y border-foreground/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0"
          style={{ animationDelay: "0.3s" }}
        >
          {metadata.map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 px-6 py-5 text-center"
            >
              <span className="font-mono text-[9px] tracking-[0.4em] text-foreground/30 uppercase">
                {item.label}
              </span>
              <span className="font-mono text-[12px] tracking-wide text-foreground/70">
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <div
          className="animate-slide-up w-full"
          style={{ animationDelay: "0.4s" }}
        >
          <LandingCta />
        </div>

        <div className="mt-2 flex flex-col items-center gap-2 text-foreground/30">
          <span className="font-mono text-[9px] tracking-[0.4em] uppercase">
            Scroll
          </span>
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={18}
            strokeWidth={1.5}
            className="animate-bounce"
          />
        </div>
      </div>
    </section>
  )
}
