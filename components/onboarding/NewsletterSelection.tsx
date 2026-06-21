"use client"

import * as React from "react"
import { signIn } from "next-auth/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Alert02Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Mail01Icon,
  Notification03Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons"

import {
  useNewslettersQuery,
  useCompleteOnboardingMutation,
} from "@/queries/onboarding"
import { useAddSendersMutation } from "@/queries/senders"
import { ReconnectRequiredError } from "@/services/onboarding"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StagedLoader } from "@/components/ui/staged-loader"
import { NewsletterCard } from "@/components/onboarding/NewsletterCard"
import { ManualAddForm } from "@/components/onboarding/ManualAddForm"
import { OnboardingSuccess } from "@/components/onboarding/OnboardingSuccess"
import type { SenderInput } from "@/shared/types"

const PAGE_SIZE = 12
const ALL = "__all__"
const NOISE = "__noise__"

// Narration for the detect → group request, which fans out server-side (Gmail
// scan + AI categorization) with no real progress to report.
const LOADING_STAGES = [
  "Connecting to Gmail",
  "Scanning your inbox",
  "Detecting newsletters",
  "Grouping by topic",
  "Almost ready",
]

export function NewsletterSelection() {
  const { data, isLoading, error, refetch } = useNewslettersQuery()
  const addSenders = useAddSendersMutation()
  const complete = useCompleteOnboardingMutation()

  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [manual, setManual] = React.useState<SenderInput[]>([])
  const [done, setDone] = React.useState(false)
  const [active, setActive] = React.useState<string>(ALL)
  const [query, setQuery] = React.useState("")
  const [page, setPage] = React.useState(0)

  const candidates = React.useMemo(() => data?.candidates ?? [], [data])
  const editorial = React.useMemo(
    () => candidates.filter((c) => !c.isNoise),
    [candidates]
  )
  const noise = React.useMemo(
    () => candidates.filter((c) => c.isNoise),
    [candidates]
  )

  const categories = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of editorial) {
      counts.set(c.category, (counts.get(c.category) ?? 0) + 1)
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }))
  }, [editorial])

  const filtered = React.useMemo(() => {
    const base =
      active === ALL
        ? editorial
        : active === NOISE
          ? noise
          : editorial.filter((c) => c.category === active)
    const q = query.trim().toLowerCase()
    if (!q) return base
    return base.filter(
      (c) =>
        c.senderEmail.toLowerCase().includes(q) ||
        (c.senderName?.toLowerCase().includes(q) ?? false)
    )
  }, [active, query, editorial, noise])

  const filterKey = `${active}|${query}`
  const [prevFilterKey, setPrevFilterKey] = React.useState(filterKey)
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setPage(0)
  }

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount - 1)
  const pageItems = filtered.slice(
    safePage * PAGE_SIZE,
    safePage * PAGE_SIZE + PAGE_SIZE
  )

  if (done) return <OnboardingSuccess />
  if (error instanceof ReconnectRequiredError) return <ReconnectPrompt />
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

  const detectable = editorial.filter((c) => !c.alreadyWatched)
  const totalChosen = selected.size + manual.length
  const isSaving = addSenders.isPending || complete.isPending

  // Selectable (not already-watched) senders in the current filtered view.
  const selectableInView = filtered.filter((c) => !c.alreadyWatched)
  const allInViewSelected =
    selectableInView.length > 0 &&
    selectableInView.every((c) => selected.has(c.senderEmail))

  function toggle(email: string, checked: boolean) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(email)
      else next.delete(email)
      return next
    })
  }

  function toggleAllInView() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allInViewSelected) {
        for (const c of selectableInView) next.delete(c.senderEmail)
      } else {
        for (const c of selectableInView) next.add(c.senderEmail)
      }
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

  const hasCandidates = candidates.length > 0

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
          {isLoading
            ? "Reading your inbox and grouping your newsletters by topic — this takes a few seconds. You can add senders by hand meanwhile."
            : detectable.length > 0
              ? `We sorted ${detectable.length} newsletter${
                  detectable.length === 1 ? "" : "s"
                } from your inbox into categories. Pick the ones you want summarized — or add any sender by hand.`
              : "Add the senders you want summarized below."}
        </p>
      </div>

      {isLoading ? (
        <StagedLoader stages={LOADING_STAGES} />
      ) : hasCandidates ? (
        <div className="flex flex-col gap-5">
          {/* Search */}
          <div className="relative">
            <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-foreground/40">
              <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.8} />
            </span>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email…"
              className="pl-10"
              aria-label="Search newsletters"
            />
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-2">
            <CategoryChip
              label="All"
              count={editorial.length}
              active={active === ALL}
              onClick={() => setActive(ALL)}
            />
            {categories.map((c) => (
              <CategoryChip
                key={c.name}
                label={c.name}
                count={c.count}
                active={active === c.name}
                onClick={() => setActive(c.name)}
              />
            ))}
            {noise.length > 0 ? (
              <CategoryChip
                label="Alerts & notifications"
                count={noise.length}
                active={active === NOISE}
                muted
                icon={Notification03Icon}
                onClick={() => setActive(NOISE)}
              />
            ) : null}
          </div>

          {/* Toolbar: select-all + result count */}
          <div className="flex items-center justify-between gap-4">
            <span className="font-mono text-[11px] tracking-[0.15em] text-foreground/40 uppercase">
              {filtered.length} sender{filtered.length === 1 ? "" : "s"}
            </span>
            {selectableInView.length > 0 ? (
              <button
                type="button"
                onClick={toggleAllInView}
                className="font-mono text-[11px] tracking-[0.15em] text-foreground/50 uppercase transition-colors hover:text-foreground"
              >
                {allInViewSelected ? "Clear shown" : "Select shown"}
              </button>
            ) : null}
          </div>

          {/* List */}
          {active === NOISE ? (
            <p className="-mt-2 font-sans text-xs leading-relaxed font-light text-foreground/45">
              These look like automated alerts and notifications rather than
              newsletters. Select any you actually want summarized.
            </p>
          ) : null}

          {pageItems.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pageItems.map((c) => (
                <NewsletterCard
                  key={c.senderEmail}
                  candidate={c}
                  checked={c.alreadyWatched || selected.has(c.senderEmail)}
                  disabled={c.alreadyWatched}
                  showCategory={active === ALL}
                  onToggle={(checked) => toggle(c.senderEmail, checked)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-foreground/15 py-10 text-center font-sans text-sm text-foreground/55">
              No senders match your search.
            </div>
          )}

          {/* Pagination */}
          {pageCount > 1 ? (
            <Pagination
              page={safePage}
              pageCount={pageCount}
              onPrev={() => setPage((p) => Math.max(0, p - 1))}
              onNext={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            />
          ) : null}
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

      <div className="sticky bottom-0 -mx-1 flex items-center justify-between gap-4 border-t border-foreground/10 bg-background/80 px-1 pt-6 pb-4 backdrop-blur">
        <span className="font-mono text-[11px] tracking-[0.2em] text-foreground/40 uppercase">
          {totalChosen} selected
        </span>
        <Button
          variant="silver"
          size="lg"
          onClick={onContinue}
          disabled={isSaving || isLoading}
        >
          {isSaving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  )
}

function CategoryChip({
  label,
  count,
  active,
  muted,
  icon,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  muted?: boolean
  icon?: typeof Notification03Icon
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-sans text-xs transition-colors",
        active
          ? "border-foreground/30 bg-foreground/10 text-foreground"
          : "border-foreground/10 bg-foreground/2 text-foreground/55 hover:border-foreground/20 hover:text-foreground/80",
        muted && !active && "text-foreground/40"
      )}
    >
      {icon ? <HugeiconsIcon icon={icon} size={13} strokeWidth={1.8} /> : null}
      <span>{label}</span>
      <span className="font-mono text-[10px] tracking-wide opacity-60">
        {count}
      </span>
    </button>
  )
}

function Pagination({
  page,
  pageCount,
  onPrev,
  onNext,
}: {
  page: number
  pageCount: number
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 pt-1">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={page === 0}
        className="gap-1.5"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={15} strokeWidth={1.8} />
        Prev
      </Button>
      <span className="font-mono text-[11px] tracking-[0.2em] text-foreground/40 uppercase">
        Page {page + 1} / {pageCount}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={page >= pageCount - 1}
        className="gap-1.5"
      >
        Next
        <HugeiconsIcon icon={ArrowRight01Icon} size={15} strokeWidth={1.8} />
      </Button>
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
