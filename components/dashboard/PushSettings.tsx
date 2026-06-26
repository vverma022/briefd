"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Notification01Icon, AppleIcon } from "@hugeicons/core-free-icons"

import { SettingsSection } from "@/components/dashboard/SettingsSection"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { subscribePush, unsubscribePush, sendTestPush } from "@/services/push"
import { notify } from "@/lib/toast"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

// VAPID public keys are base64url; the Push API wants a Uint8Array backed by a
// plain ArrayBuffer (applicationServerKey's BufferSource type).
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = window.atob(normalized)
  const buffer = new ArrayBuffer(raw.length)
  const out = new Uint8Array(buffer)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

function errMessage(e: unknown) {
  return e instanceof Error ? e.message : undefined
}

// Stable client/server gate — false during SSR, true after hydration — without
// a synchronous setState-in-effect. The client-only feature checks derive from it.
const emptySubscribe = () => () => {}
function useIsClient() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )
}

export function PushSettings({ index }: { index: number }) {
  const isClient = useIsClient()
  const [subscribed, setSubscribed] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  // Constant on the client; gated on isClient so SSR renders the neutral state.
  const isIOS = isClient && /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isStandalone =
    isClient && window.matchMedia("(display-mode: standalone)").matches
  const supported: boolean | null = isClient
    ? "serviceWorker" in navigator && "PushManager" in window
    : null

  React.useEffect(() => {
    if (!supported) return
    // setState only inside the async callback — never synchronously in-effect.
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setSubscribed(Boolean(sub)))
      .catch(() => {})
  }, [supported])

  async function enable() {
    if (!VAPID_PUBLIC_KEY) {
      notify.error("Push isn't configured", "Missing VAPID public key.")
      return
    }
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const json = sub.toJSON()
      await subscribePush({
        endpoint: sub.endpoint,
        keys: {
          p256dh: json.keys?.p256dh ?? "",
          auth: json.keys?.auth ?? "",
        },
      })
      setSubscribed(true)
      notify.success("Push notifications on")
    } catch (e) {
      if (e instanceof DOMException && e.name === "NotAllowedError") {
        notify.error(
          "Notifications blocked",
          "Allow notifications for this site, then try again."
        )
      } else {
        notify.error("Couldn't enable push", errMessage(e))
      }
    } finally {
      setBusy(false)
    }
  }

  async function disable() {
    setBusy(true)
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      if (sub) {
        const { endpoint } = sub
        await sub.unsubscribe()
        await unsubscribePush(endpoint)
      }
      setSubscribed(false)
      notify.success("Push notifications off")
    } catch (e) {
      notify.error("Couldn't disable push", errMessage(e))
    } finally {
      setBusy(false)
    }
  }

  async function test() {
    try {
      await sendTestPush()
      notify.success("Test sent", "Check your notifications.")
    } catch (e) {
      notify.error("Couldn't send test", errMessage(e))
    }
  }

  const header = (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="flex items-center gap-2 font-sans text-sm font-medium text-foreground">
          <HugeiconsIcon
            icon={Notification01Icon}
            className="size-4 text-foreground/60"
            strokeWidth={1.5}
          />
          Push notifications
        </h3>
        <p className="max-w-sm font-sans text-xs leading-relaxed font-light text-foreground/50">
          Get a push on this device when your daily brief is ready — alongside
          or instead of the email.
        </p>
      </div>
      {supported && !(isIOS && !isStandalone) ? (
        <Switch
          checked={subscribed}
          onCheckedChange={(next) => (next ? enable() : disable())}
          disabled={busy}
          aria-label="Enable push notifications"
        />
      ) : null}
    </div>
  )

  return (
    <SettingsSection index={index} className="gap-5">
      {header}

      {/* iOS Safari only delivers web push to an INSTALLED PWA. */}
      {isIOS && !isStandalone ? (
        <div className="flex items-start gap-3 rounded-xl border border-foreground/10 bg-foreground/2 px-4 py-3">
          <HugeiconsIcon
            icon={AppleIcon}
            className="mt-0.5 size-4 shrink-0 text-foreground/60"
            strokeWidth={1.5}
          />
          <p className="font-sans text-xs leading-relaxed font-light text-foreground/55">
            On iPhone &amp; iPad, add Briefd to your Home Screen first: tap the
            Share button, then{" "}
            <span className="text-foreground/75">Add to Home Screen</span>. Open
            it from there to turn on notifications.
          </p>
        </div>
      ) : supported === false ? (
        <p className="font-sans text-xs font-light text-foreground/45">
          Push notifications aren&apos;t supported in this browser.
        </p>
      ) : subscribed ? (
        <div className="border-t border-foreground/10 pt-5">
          <Button variant="outline" size="lg" onClick={test} disabled={busy}>
            Send a test notification
          </Button>
        </div>
      ) : null}
    </SettingsSection>
  )
}
