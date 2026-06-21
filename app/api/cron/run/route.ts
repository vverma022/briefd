import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"
import { syncUser, summarizePending } from "@/app/api/_shared/pipeline"
import { deliverDueDigests } from "@/app/api/_shared/delivery"

export const runtime = "nodejs"
export const maxDuration = 60

// Triggered hourly by an external scheduler (see .github/workflows/hourly-cron.yml).
// Three passes, in order: summarize backlog, sync new mail, then deliver to any
// user whose chosen delivery hour is now. Idempotent end to end.
export async function GET(req: Request) {
  const authz = req.headers.get("authorization")
  if (!config.cronSecret || authz !== `Bearer ${config.cronSecret}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const now = new Date()
  const users = await prisma.user.findMany({ select: { id: true } })
  for (const u of users) {
    try {
      await summarizePending(u.id)
      await syncUser(u.id)
    } catch {}
  }

  // Delivery runs after sync/summarize so just-arrived mail is eligible.
  const { delivered } = await deliverDueDigests(now).catch(() => ({
    delivered: 0,
  }))

  return Response.json({ ok: true, users: users.length, delivered })
}
