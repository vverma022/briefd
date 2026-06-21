"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"

import { useProfileQuery, useUpdateProfileMutation } from "@/queries/profile"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { notify } from "@/lib/toast"
import type { UserProfile } from "@/shared/types"

const HOURS = Array.from({ length: 24 }, (_, h) => h)

function formatHour(h: number) {
  const period = h < 12 ? "AM" : "PM"
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:00 ${period}`
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

export function ProfileSettings({ initial }: { initial: UserProfile }) {
  const router = useRouter()
  const { data } = useProfileQuery(initial)
  const update = useUpdateProfileMutation()
  const profile = data ?? initial

  // Name is edit-then-save; digest prefs are optimistic toggles.
  const [name, setName] = React.useState(profile.name ?? "")
  const [emailEnabled, setEmailEnabled] = React.useState(
    profile.digestEmailEnabled
  )
  const [hour, setHour] = React.useState(profile.digestDeliveryHour)

  const initials = (profile.name ?? profile.email ?? "U")
    .slice(0, 1)
    .toUpperCase()
  const nameDirty =
    name.trim().length > 0 && name.trim() !== (profile.name ?? "")
  const tz = profile.digestTimezone ?? browserTimezone() ?? null

  function saveName() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === (profile.name ?? "")) return
    update.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          notify.success("Name updated")
          router.refresh() // refresh the server-rendered sidebar avatar/name
        },
        onError: (e) => notify.error("Couldn't update name", errMessage(e)),
      }
    )
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

  return (
    <div className="flex flex-col gap-6">
      {/* Account / profile */}
      <section className="flex flex-col gap-6 rounded-2xl border border-foreground/10 bg-foreground/2 p-6">
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
            <Button
              variant="outline"
              size="lg"
              onClick={saveName}
              disabled={!nameDirty || update.isPending}
            >
              Save
            </Button>
          </div>
          <p className="font-sans text-xs font-light text-foreground/45">
            Your email and picture come from Google and can&apos;t be edited
            here.
          </p>
        </div>
      </section>

      {/* Connected account */}
      <section className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-foreground/2 p-6">
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
      </section>

      {/* Email digest preferences */}
      <section className="flex flex-col gap-5 rounded-2xl border border-foreground/10 bg-foreground/2 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 className="font-sans text-sm font-medium text-foreground">
              Daily email digest
            </h3>
            <p className="max-w-sm font-sans text-xs leading-relaxed font-light text-foreground/50">
              Get a single Briefd email with your newsletter summaries,
              delivered to your inbox once a day.
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

        <p className="font-sans text-[11px] font-light text-foreground/35">
          Email delivery is being wired up — your preference is saved for when
          it ships.
        </p>
      </section>
    </div>
  )
}
