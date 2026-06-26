import webpush from "web-push"

import { config } from "@/lib/config"
import { prisma } from "@/lib/prisma"

export type PushPayload = {
  title: string
  body: string
  url?: string
}

export function isPushConfigured(): boolean {
  return Boolean(config.push.publicKey && config.push.privateKey)
}

let configured = false
function ensureVapid() {
  if (configured) return
  if (!config.push.publicKey || !config.push.privateKey) {
    throw new Error("VAPID keys are not set")
  }
  webpush.setVapidDetails(
    config.push.subject,
    config.push.publicKey,
    config.push.privateKey
  )
  configured = true
}

// A subscription is dead once the push service returns 404/410 — prune it so we
// stop trying. Other errors (network, 5xx) are transient and left in place.
function isGone(err: unknown): boolean {
  const code = (err as { statusCode?: number } | null)?.statusCode
  return code === 404 || code === 410
}

// Send a push to every device the user has subscribed. Returns the number of
// successful sends; dead subscriptions are deleted as we go. No-op (returns 0)
// when VAPID isn't configured, so the rest of the pipeline degrades gracefully.
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<number> {
  if (!isPushConfigured()) return 0
  ensureVapid()

  const subs = await prisma.pushSubscription.findMany({ where: { userId } })
  const data = JSON.stringify(payload)
  let sent = 0

  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        data
      )
      sent++
    } catch (err) {
      if (isGone(err)) {
        await prisma.pushSubscription
          .delete({ where: { id: s.id } })
          .catch(() => {})
      }
    }
  }
  return sent
}
