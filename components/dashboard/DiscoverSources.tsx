"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  Mail01Icon,
  RefreshIcon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import { useNewslettersQuery } from "@/queries/onboarding"
import { useAddSendersMutation } from "@/queries/senders"
import { ReconnectRequiredError } from "@/services/onboarding"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StagedLoader } from "@/components/ui/staged-loader"
import { NewsletterCard } from "@/components/onboarding/NewsletterCard"
import type { SenderInput } from "@/shared/types"

const LOADING_STAGES = [
  "Connecting to Gmail",
  "Scanning your inbox",
  "Detecting newsletters",
  "Grouping by topic",
  "Almost ready",
]

export function DiscoverSources() {
  const [open, setOpen] = React.useState(false)
  const { data, isLoading, isFetching, error, refetch } =
    useNewslettersQuery(open)
  const addSenders = useAddSendersMutation()

  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [query, setQuery] = React.useState("")

  // Newsletters we don't already watch — the only ones worth discovering.
  // Editorial first, then automated alerts; both selectable.
  const detectable = React.useMemo(() => {
    const candidates = (data?.candidates ?? []).filter((c) => !c.alreadyWatched)
    const q = query.trim().toLowerCase()
    const matched = q
      ? candidates.filter(
          (c) =>
            c.senderEmail.toLowerCase().includes(q) ||
            (c.senderName?.toLowerCase().includes(q) ?? false)
        )
      : candidates
    return [...matched].sort(
      (a, b) => Number(a.isNoise) - Number(b.isNoise) || b.count - a.count
    )
  }, [data, query])

  function toggle(email: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(email)
      else next.delete(email)
      return next
    })
  }

  function addSelected() {
    const chosen: SenderInput[] = (data?.candidates ?? [])
      .filter((c) => selected.has(c.senderEmail))
      .map((c) => ({
        senderEmail: c.senderEmail,
        senderName: c.senderName ?? undefined,
      }))
    if (chosen.length === 0) return
    addSenders.mutate(chosen, {
      onSuccess: () => {
        notify.success(
          "Sources added",
          `${chosen.length} newsletter${chosen.length === 1 ? "" : "s"} added`
        )
        setSelected(new Set())
      },
      onError: (e) =>
        notify.error(
          "Couldn't add",
          e instanceof Error ? e.message : undefined
        ),
    })
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 rounded-2xl border border-dashed border-foreground/15 px-5 py-4 text-left transition-colors hover:border-foreground/30"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-foreground/10 bg-foreground/5 text-foreground/70">
          <HugeiconsIcon icon={Search01Icon} size={17} strokeWidth={1.6} />
        </span>
        <span className="flex flex-col">
          <span className="font-sans text-sm font-medium text-foreground">
            Discover newsletters from Gmail
          </span>
          <span className="font-sans text-xs font-light text-foreground/50">
            Re-scan your inbox to find newsletters you haven&apos;t added yet.
          </span>
        </span>
      </button>
    )
  }

  if (error instanceof ReconnectRequiredError) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-foreground/10 py-10 text-center">
        <HugeiconsIcon
          icon={Alert02Icon}
          size={24}
          strokeWidth={1.5}
          className="text-foreground/60"
        />
        <p className="max-w-sm font-sans text-sm font-light text-foreground/60">
          Your Gmail connection expired. Reconnect to scan for newsletters.
        </p>
        <Button
          variant="silver"
          size="lg"
          onClick={() => signIn("google", { redirectTo: "/sources" })}
        >
          Reconnect Gmail
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-foreground/2 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
          Discover from Gmail
        </h3>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.2em] text-foreground/50 uppercase transition-colors hover:text-foreground disabled:opacity-50"
        >
          <HugeiconsIcon
            icon={RefreshIcon}
            size={13}
            strokeWidth={1.8}
            className={cn(isFetching && "animate-spin")}
          />
          Rescan
        </button>
      </div>

      {isLoading ? (
        <StagedLoader stages={LOADING_STAGES} />
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <p className="font-sans text-sm text-foreground/60">
            {error instanceof Error ? error.message : "Something went wrong."}
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      ) : (
        <>
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-foreground/40">
              <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.8} />
            </span>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search detected newsletters…"
              className="pl-10"
              aria-label="Search detected newsletters"
            />
          </div>

          {detectable.length > 0 ? (
            <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto pr-1">
              {detectable.map((c) => (
                <NewsletterCard
                  key={c.senderEmail}
                  candidate={c}
                  checked={selected.has(c.senderEmail)}
                  showCategory
                  onToggle={(checked) => toggle(c.senderEmail, checked)}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-foreground/15 py-10 text-center">
              <HugeiconsIcon
                icon={Mail01Icon}
                size={22}
                strokeWidth={1.5}
                className="text-foreground/40"
              />
              <p className="font-sans text-sm text-foreground/55">
                {query
                  ? "No detected newsletters match your search."
                  : "No new newsletters found — you're already watching them all."}
              </p>
            </div>
          )}

          {detectable.length > 0 ? (
            <div className="flex items-center justify-between gap-4 pt-1">
              <span className="font-mono text-[11px] tracking-[0.2em] text-foreground/40 uppercase">
                {selected.size} selected
              </span>
              <Button
                variant="silver"
                size="sm"
                onClick={addSelected}
                disabled={selected.size === 0 || addSenders.isPending}
              >
                {addSenders.isPending ? "Adding…" : "Add selected"}
              </Button>
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}
