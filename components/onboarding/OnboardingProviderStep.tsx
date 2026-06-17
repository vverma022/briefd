import { SiGmail } from "react-icons/si"

import { SignInButton } from "@/components/onboarding/SignInButton"

export function OnboardingProviderStep() {
  return (
    <div className="flex flex-col items-center gap-10 text-center">
      <div className="animate-slide-up flex flex-col items-center gap-4">
        <span className="font-mono text-[10px] tracking-[0.4em] text-foreground/40 uppercase">
          Step 1 · Connect your inbox
        </span>
        <h1 className="font-serif text-4xl leading-[0.95] text-foreground italic sm:text-5xl">
          Connect Gmail to <span className="silver-text">get briefed.</span>
        </h1>
        <p className="mx-auto max-w-md font-sans text-sm leading-relaxed font-light text-foreground/60">
          We read your inbox with{" "}
          <strong className="font-medium text-foreground/80">read-only</strong>{" "}
          access to find the newsletters you already subscribe to. We never send
          mail on your behalf.
        </p>
      </div>

      <div
        className="animate-slide-up frosted-glass flex w-full max-w-md flex-col items-center gap-6 rounded-2xl p-8 text-center"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5">
            <SiGmail className="size-6 text-[#EA4335]" />
          </div>
          <div className="flex flex-col items-center">
            <span className="font-sans text-sm font-medium text-foreground">
              Gmail
            </span>
            <span className="font-mono text-[10px] tracking-[0.2em] text-foreground/40 uppercase">
              gmail.readonly
            </span>
          </div>
        </div>
        <SignInButton />
      </div>

      <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/30 uppercase">
        More providers coming soon
      </span>
    </div>
  )
}
