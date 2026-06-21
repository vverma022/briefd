"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SparklesIcon } from "@hugeicons/core-free-icons"
import { SiGooglegemini, SiClaude, SiOpenai } from "react-icons/si"

import { useProfileQuery, useUpdateProfileMutation } from "@/queries/profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SaveButton } from "@/components/common/SaveButton"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { notify } from "@/lib/toast"
import { cn } from "@/lib/utils"
import type { UpdateProfileInput, UserProfile } from "@/shared/types"

const HOURS = Array.from({ length: 24 }, (_, h) => h)

function formatHour(h: number) {
  const period = h < 12 ? "AM" : "PM"
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:00 ${period}`
}

const LENGTHS: { value: UserProfile["summaryLength"]; label: string }[] = [
  { value: "short", label: "Short" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
]

// Skeleton shape per length — how many tldr lines and takeaway bullets the
// preview draws, plus deterministic widths so it reads like a real brief.
const LENGTH_SHAPE: Record<
  UserProfile["summaryLength"],
  { lines: number[]; bullets: number[] }
> = {
  short: { lines: [70], bullets: [82, 64] },
  standard: { lines: [100, 100, 58], bullets: [88, 72, 60] },
  detailed: { lines: [100, 100, 100, 66], bullets: [90, 78, 70, 84, 58] },
}

const PROVIDER_CARDS: {
  value: UserProfile["aiProvider"]
  label: string
  icon: React.ReactNode
}[] = [
  {
    value: "default",
    label: "Briefd",
    icon: (
      <HugeiconsIcon icon={SparklesIcon} className="size-6" strokeWidth={1.5} />
    ),
  },
  {
    value: "google",
    label: "Gemini",
    icon: <SiGooglegemini className="size-6" />,
  },
  {
    value: "anthropic",
    label: "Claude",
    icon: <SiClaude className="size-6" />,
  },
  { value: "openai", label: "OpenAI", icon: <SiOpenai className="size-6" /> },
]

// A faux brief rendered with skeleton bars whose density tracks the selected
// length, so the choice is tangible. Re-keyed on `length` to fade between shapes.
function BriefLengthPreview({
  length,
}: {
  length: UserProfile["summaryLength"]
}) {
  const shape = LENGTH_SHAPE[length]
  return (
    <motion.div
      key={length}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border border-foreground/10 bg-foreground/2 p-4"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="size-4 rounded-full bg-foreground/10" />
        <Skeleton className="h-2 w-20 rounded-full" />
        <span className="ml-auto font-mono text-[9px] tracking-[0.2em] text-foreground/30 uppercase">
          {length} preview
        </span>
      </div>
      <Skeleton className="h-3.5 w-3/5 rounded-md" />
      <div className="mt-3 flex flex-col gap-2">
        {shape.lines.map((w, i) => (
          <Skeleton
            key={i}
            className="h-2 rounded-full"
            style={{ width: `${w}%` }}
          />
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {shape.bullets.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="size-1.5 shrink-0 rounded-full bg-foreground/20" />
            <Skeleton className="h-2 rounded-full" style={{ width: `${w}%` }} />
          </div>
        ))}
      </div>
    </motion.div>
  )
}

// Provider picker as logo cards (replaces a dropdown) — recognizable marks,
// one tap to switch.
function ProviderCards({
  value,
  disabled,
  onChange,
}: {
  value: UserProfile["aiProvider"]
  disabled?: boolean
  onChange: (value: UserProfile["aiProvider"]) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {PROVIDER_CARDS.map((p) => {
        const active = value === p.value
        return (
          <button
            key={p.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(p.value)}
            data-active={active}
            aria-pressed={active}
            className={cn(
              "flex flex-col items-center gap-2.5 rounded-2xl border px-3 py-4 transition-all duration-200 disabled:opacity-50",
              active
                ? "border-foreground/30 bg-foreground/5 text-foreground"
                : "border-foreground/10 text-foreground/55 hover:border-foreground/20 hover:text-foreground/80"
            )}
          >
            {p.icon}
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase">
              {p.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function browserTimezone(): string | undefined {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return undefined
  }
}

function errMessage(e: unknown) {
  return e instanceof Error ? e.message : undefined
}

// Stagger settings sections in on mount, matching the app's editorial easing.
function Section({
  index,
  className,
  children,
}: {
  index: number
  className?: string
  children: React.ReactNode
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.07,
      }}
      className={cn(
        "flex flex-col gap-6 rounded-2xl border border-foreground/10 bg-foreground/2 p-6",
        className
      )}
    >
      {children}
    </motion.section>
  )
}

export function ProfileSettings({ initial }: { initial: UserProfile }) {
  const router = useRouter()
  const { data } = useProfileQuery(initial)
  const update = useUpdateProfileMutation()
  const profile = data ?? initial

  // Name is edit-then-save; the rest are optimistic toggles / inline saves.
  const [name, setName] = React.useState(profile.name ?? "")
  const [emailEnabled, setEmailEnabled] = React.useState(
    profile.digestEmailEnabled
  )
  const [hour, setHour] = React.useState(profile.digestDeliveryHour)
  const [length, setLength] = React.useState(profile.summaryLength)
  const [provider, setProvider] = React.useState(profile.aiProvider)
  const [apiKey, setApiKey] = React.useState("")

  const initials = (profile.name ?? profile.email ?? "U")
    .slice(0, 1)
    .toUpperCase()
  const nameDirty =
    name.trim().length > 0 && name.trim() !== (profile.name ?? "")
  const tz = profile.digestTimezone ?? browserTimezone() ?? null

  async function saveName() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === (profile.name ?? "")) return
    try {
      await update.mutateAsync({ name: trimmed })
      notify.success("Name updated")
      router.refresh() // refresh the server-rendered sidebar avatar/name
    } catch (e) {
      notify.error("Couldn't update name", errMessage(e))
      throw e
    }
  }

  function toggleEmail(next: boolean) {
    setEmailEnabled(next)
    update.mutate(
      { digestEmailEnabled: next, digestTimezone: browserTimezone() },
      {
        onError: (e) => {
          setEmailEnabled(!next)
          notify.error("Couldn't update preference", errMessage(e))
        },
      }
    )
  }

  function changeHour(next: number) {
    const prev = hour
    setHour(next)
    update.mutate(
      { digestDeliveryHour: next, digestTimezone: browserTimezone() },
      {
        onError: (e) => {
          setHour(prev)
          notify.error("Couldn't update delivery time", errMessage(e))
        },
      }
    )
  }

  function changeLength(next: UserProfile["summaryLength"]) {
    if (next === length) return
    const prev = length
    setLength(next)
    update.mutate(
      { summaryLength: next },
      {
        onError: (e) => {
          setLength(prev)
          notify.error("Couldn't update summary length", errMessage(e))
        },
      }
    )
  }

  async function saveProvider() {
    const input: UpdateProfileInput = { aiProvider: provider }
    if (provider !== "default" && apiKey.trim()) {
      input.aiApiKey = apiKey.trim()
    }
    try {
      await update.mutateAsync(input)
      setApiKey("")
      notify.success(
        provider === "default"
          ? "Using Briefd's summarization"
          : "Summarization provider saved"
      )
    } catch (e) {
      notify.error("Couldn't save provider", errMessage(e))
      throw e
    }
  }

  async function removeKey() {
    await update.mutateAsync({ aiProvider: "default" })
    setProvider("default")
    setApiKey("")
    notify.success("Custom key removed")
  }

  const keyActive = profile.hasCustomKey && profile.aiProvider === provider

  return (
    <div className="flex flex-col gap-6">
      {/* Account / profile */}
      <Section index={0}>
        <div className="flex items-center gap-4">
          <Avatar className="size-16 rounded-2xl">
            {profile.image ? <AvatarImage src={profile.image} alt="" /> : null}
            <AvatarFallback className="rounded-2xl text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-serif text-xl text-foreground italic">
              {profile.name ?? "Your account"}
            </span>
            <span className="truncate font-mono text-[11px] tracking-wide text-foreground/45">
              {profile.email}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label
            htmlFor="displayName"
            className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase"
          >
            Display name
          </Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="displayName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={80}
              className="flex-1"
            />
            <SaveButton onSave={saveName} disabled={!nameDirty} />
          </div>
          <p className="font-sans text-xs font-light text-foreground/45">
            Your email and picture come from Google and can&apos;t be edited
            here.
          </p>
        </div>
      </Section>

      {/* Connected account */}
      <Section index={1} className="gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-sans text-sm font-medium text-foreground">
            Connected account
          </h3>
          <p className="max-w-md font-sans text-xs leading-relaxed font-light text-foreground/50">
            Connected to Gmail as{" "}
            <span className="text-foreground/70">{profile.email}</span>. Switch
            to a different Google account to reconnect and pick newsletters
            again.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="lg"
            onClick={() =>
              signIn(
                "google",
                { redirectTo: "/onboarding" },
                { prompt: "select_account consent" }
              )
            }
          >
            Switch Google account
          </Button>
        </div>
      </Section>

      {/* Email digest preferences */}
      <Section index={2} className="gap-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-sans text-sm font-medium text-foreground">
              Daily email digest
            </h3>
            <p className="max-w-sm font-sans text-xs leading-relaxed font-light text-foreground/50">
              One Briefd email with all your newsletter summaries from the past
              day, delivered at the time you choose.
            </p>
          </div>
          <Switch
            checked={emailEnabled}
            onCheckedChange={toggleEmail}
            disabled={update.isPending}
            aria-label="Enable daily email digest"
          />
        </div>

        {emailEnabled ? (
          <div className="flex flex-col gap-2 border-t border-foreground/10 pt-5">
            <Label className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
              Delivery time
            </Label>
            <div className="flex flex-wrap items-center gap-3">
              <Select
                value={String(hour)}
                onValueChange={(v) => changeHour(Number(v))}
              >
                <SelectTrigger className="w-36" size="default">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOURS.map((h) => (
                    <SelectItem key={h} value={String(h)}>
                      {formatHour(h)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {tz ? (
                <span className="font-mono text-[11px] tracking-wide text-foreground/40">
                  {tz}
                </span>
              ) : null}
            </div>
          </div>
        ) : null}
      </Section>

      {/* Summarization preferences */}
      <Section index={3} className="gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="font-sans text-sm font-medium text-foreground">
            Summarization
          </h3>
          <p className="max-w-md font-sans text-xs leading-relaxed font-light text-foreground/50">
            Tune how detailed your briefs are, and optionally use your own AI
            provider key for summarization.
          </p>
        </div>

        {/* Length segmented control + live skeleton preview */}
        <div className="flex flex-col gap-3">
          <Label className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
            Brief length
          </Label>
          <div className="inline-flex w-fit rounded-full border border-foreground/10 bg-foreground/5 p-1">
            {LENGTHS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => changeLength(l.value)}
                disabled={update.isPending}
                data-active={length === l.value}
                className="rounded-full px-4 py-1.5 font-mono text-[11px] tracking-[0.2em] text-foreground/55 uppercase transition-colors hover:text-foreground data-[active=true]:bg-foreground data-[active=true]:text-background"
              >
                {l.label}
              </button>
            ))}
          </div>
          <BriefLengthPreview length={length} />
        </div>

        {/* Provider + BYOK */}
        <div className="flex flex-col gap-3 border-t border-foreground/10 pt-5">
          <Label className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
            AI provider
          </Label>
          <ProviderCards
            value={provider}
            disabled={update.isPending}
            onChange={setProvider}
          />

          {provider === "default" ? (
            <p className="font-sans text-xs font-light text-foreground/45">
              Summaries use Briefd&apos;s own key — nothing to configure.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {keyActive ? (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-foreground/10 bg-foreground/2 px-4 py-3">
                  <span className="inline-flex items-center gap-2 font-mono text-[11px] tracking-wide text-foreground/70">
                    <span className="size-1.5 rounded-full bg-(--toast-success)" />
                    Custom key active
                  </span>
                  <ConfirmDialog
                    title="Remove your API key?"
                    description="Briefd will go back to summarizing with its own key. Your stored key is deleted."
                    confirmLabel="Remove key"
                    destructive
                    onConfirm={() =>
                      removeKey().catch((e) => {
                        notify.error("Couldn't remove key", errMessage(e))
                      })
                    }
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto text-foreground/55 hover:bg-destructive/10 hover:text-destructive"
                    >
                      Remove
                    </Button>
                  </ConfirmDialog>
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <Label
                  htmlFor="aiApiKey"
                  className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase"
                >
                  API key
                </Label>
                <Input
                  id="aiApiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    keyActive ? "Replace key (optional)" : "Paste your API key"
                  }
                  autoComplete="off"
                  maxLength={400}
                  className="max-w-xs"
                />
                <p className="font-sans text-[11px] font-light text-foreground/40">
                  Just the key — we pick the best summarization model for your
                  provider. It&apos;s verified, encrypted, and never shown
                  again; usage is billed to your own account.
                </p>
              </div>
            </div>
          )}

          <div>
            <SaveButton onSave={saveProvider}>Save provider</SaveButton>
          </div>
        </div>
      </Section>
    </div>
  )
}
