"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Alert02Icon, Mail01Icon } from "@hugeicons/core-free-icons"

import {
  useNewslettersQuery,
  useCompleteOnboardingMutation,
} from "@/queries/onboarding"
import { useAddSendersMutation } from "@/queries/senders"
import { ReconnectRequiredError } from "@/services/onboarding"
import { notify } from "@/lib/toast"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { NewsletterCard } from "@/components/onboarding/NewsletterCard"
import { ManualAddForm } from "@/components/onboarding/ManualAddForm"
import { OnboardingSuccess } from "@/components/onboarding/OnboardingSuccess"
import type { SenderInput } from "@/shared/types"

export function NewsletterSelection() {
  const { data, isLoading, error, refetch } = useNewslettersQuery()
  const addSenders = useAddSendersMutation()
  const complete = useCompleteOnboardingMutation()

  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [manual, setManual] = React.useState<SenderInput[]>([])
  const [done, setDone] = React.useState(false)

  if (done) return <OnboardingSuccess />
  if (error instanceof ReconnectRequiredError) return <ReconnectPrompt />
  if (isLoading) return <SelectionSkeleton />
  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="font-sans text-sm text-foreground/60">{error.message}</p>
        <Button variant="outline" size="lg" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    )
  }

  const candidates = data?.candidates ?? []
  const detectable = candidates.filter((c) => !c.alreadyWatched)
  const totalChosen = selected.size + manual.length
  const isSaving = addSenders.isPending || complete.isPending

  function toggle(email: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(email)
      else next.delete(email)
      return next
    })
  }

  function addManual(sender: SenderInput) {
    const email = sender.senderEmail.toLowerCase()
    const exists =
      manual.some((m) => m.senderEmail.toLowerCase() === email) ||
      candidates.some((c) => c.senderEmail === email)
    if (exists) {
      notify.warning("Already in your list", email)
      return
    }
    setManual((prev) => [...prev, { senderEmail: email }])
  }

  function removeManual(email: string) {
    setManual((prev) => prev.filter((m) => m.senderEmail !== email))
  }

  async function onContinue() {
    const chosen: SenderInput[] = [
      ...candidates
        .filter((c) => selected.has(c.senderEmail))
        .map((c) => ({
          senderEmail: c.senderEmail,
          senderName: c.senderName ?? undefined,
        })),
      ...manual,
    ]
    try {
      if (chosen.length > 0) await addSenders.mutateAsync(chosen)
      await complete.mutateAsync()
      notify.success(
        "You're all set",
        chosen.length
          ? `${chosen.length} newsletter${chosen.length === 1 ? "" : "s"} added`
          : undefined
      )
      setDone(true)
    } catch (e) {
      notify.error(
        "Something went wrong",
        e instanceof Error ? e.message : undefined
      )
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="animate-slide-up flex flex-col gap-3 text-center">
        <span className="font-mono text-[10px] tracking-[0.4em] text-foreground/40 uppercase">
          Step 2 · Choose your newsletters
        </span>
        <h1 className="font-serif text-4xl leading-[0.95] text-foreground italic sm:text-5xl">
          Pick what you want <span className="silver-text">briefed.</span>
        </h1>
        <p className="mx-auto max-w-md font-sans text-sm leading-relaxed font-light text-foreground/60">
          {detectable.length > 0
            ? `We found ${detectable.length} newsletter${
                detectable.length === 1 ? "" : "s"
              } in your inbox. Pick the ones you want summarized — or add any sender by hand.`
            : "Add the senders you want summarized below."}
        </p>
      </div>

      {candidates.length > 0 ? (
        <div className="flex flex-col gap-3">
          {candidates.map((c) => (
            <NewsletterCard
              key={c.senderEmail}
              candidate={c}
              checked={c.alreadyWatched || selected.has(c.senderEmail)}
              disabled={c.alreadyWatched}
              onToggle={(checked) => toggle(c.senderEmail, checked)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-foreground/15 py-10 text-center">
          <HugeiconsIcon
            icon={Mail01Icon}
            size={24}
            strokeWidth={1.5}
            className="text-foreground/40"
          />
          <p className="font-sans text-sm text-foreground/60">
            No newsletters detected in the last 90 days.
          </p>
        </div>
      )}

      <ManualAddForm onAdd={addManual} />

      {manual.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {manual.map((m) => (
            <span
              key={m.senderEmail}
              className="flex items-center gap-2 rounded-full border border-foreground/15 bg-foreground/5 py-1.5 pr-2 pl-3 font-mono text-[11px] tracking-wide text-foreground/70"
            >
              {m.senderEmail}
              <button
                type="button"
                aria-label={`Remove ${m.senderEmail}`}
                onClick={() => removeManual(m.senderEmail)}
                className="flex size-4 items-center justify-center rounded-full text-foreground/40 transition-colors hover:bg-foreground/10 hover:text-foreground"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4 border-t border-foreground/10 pt-6">
        <span className="font-mono text-[11px] tracking-[0.2em] text-foreground/40 uppercase">
          {totalChosen} selected
        </span>
        <Button
          variant="silver"
          size="lg"
          onClick={onContinue}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  )
}

function SelectionSkeleton() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[68px] w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

function ReconnectPrompt() {
  return (
    <div className="animate-slide-up flex flex-col items-center gap-6 py-10 text-center">
      <div className="flex size-14 items-center justify-center rounded-2xl border border-foreground/10 bg-foreground/5">
        <HugeiconsIcon
          icon={Alert02Icon}
          size={26}
          strokeWidth={1.5}
          className="text-foreground"
        />
      </div>
      <div className="flex flex-col gap-2">
        <h2 className="font-serif text-3xl text-foreground italic">
          Reconnect Gmail
        </h2>
        <p className="mx-auto max-w-sm font-sans text-sm leading-relaxed font-light text-foreground/60">
          Your Gmail connection expired. Reconnect to finish picking your
          newsletters.
        </p>
      </div>
      <Button
        variant="silver"
        size="lg"
        onClick={() => signIn("google", { redirectTo: "/onboarding" })}
      >
        Reconnect Gmail
      </Button>
    </div>
  )
}
