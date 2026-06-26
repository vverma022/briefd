import { auth } from "@/auth"
import { config } from "@/lib/config"
import { sendPushToUser } from "@/lib/push"

export const runtime = "nodejs"

// Sends a test notification to the caller's own devices — used by the "Send test"
// button in settings to confirm push is wired up end to end.
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sent = await sendPushToUser(session.user.id, {
    title: "Briefd",
    body: "Push notifications are on — this is a test.",
    url: `${config.site.url.replace(/\/$/, "")}/dashboard`,
  })

  if (sent === 0) {
    return Response.json(
      { error: "No active subscription to send to." },
      { status: 409 }
    )
  }
  return Response.json({ ok: true, sent })
}
