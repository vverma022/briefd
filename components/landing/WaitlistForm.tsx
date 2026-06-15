"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons"

export function WaitlistForm() {
  const [email, setEmail] = React.useState("")
  const [submitted, setSubmitted] = React.useState(false)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!email.trim()) return
    setSubmitted(true)
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      {submitted ? (
        <div className="frosted-glass flex items-center justify-center gap-3 rounded-2xl px-6 py-5 text-center">
          <HugeiconsIcon
            icon={CheckmarkBadge01Icon}
            size={18}
            className="text-foreground"
            strokeWidth={1.5}
          />
          <p className="font-mono text-[11px] tracking-[0.25em] text-foreground/80 uppercase">
            You&apos;re on the waitlist — we&apos;ll email you at launch
          </p>
        </div>
      ) : (
        <form
          onSubmit={onSubmit}
          className="frosted-glass flex flex-col gap-3 rounded-2xl p-3 sm:flex-row sm:items-center"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@gmail.com"
            className="w-full flex-1 bg-transparent px-5 py-3.5 font-mono text-sm tracking-wide text-foreground placeholder:text-foreground/30 focus:outline-none"
          />
          <button
            type="submit"
            className="silver-btn flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-mono text-[12px] font-bold tracking-[0.25em] uppercase"
          >
            Join the waitlist
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={2} />
          </button>
        </form>
      )}
      <p className="mt-4 text-center font-mono text-[10px] tracking-[0.3em] text-foreground/30 uppercase">
        Read-only Gmail access · No spam, ever
      </p>
    </div>
  )
}
