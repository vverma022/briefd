import { LandingCta } from "@/components/landing/LandingCta"

export function CTA() {
  return (
    <section
      id="join"
      className="relative z-10 mx-auto flex w-[92vw] flex-col items-center gap-8 py-24 text-center"
    >
      <span className="font-mono text-[10px] tracking-[0.5em] text-foreground/40 uppercase">
        Be first in line
      </span>

      <h2 className="max-w-3xl font-serif text-4xl leading-[0.9] text-foreground italic sm:text-6xl">
        Inbox zero, <span className="silver-text">without the inbox.</span>
      </h2>

      <p className="max-w-md font-sans text-sm leading-relaxed font-light text-foreground/50">
        Join the waitlist and we&apos;ll email you the moment Briefd opens up.
      </p>

      <LandingCta />
    </section>
  )
}
