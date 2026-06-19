import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"
import { syncUser, summarizePending } from "@/app/api/_shared/pipeline"

export const runtime = "nodejs"
export const maxDuration = 60

export async function GET(req: Request) {
  const authz = req.headers.get("authorization")
  if (!config.cronSecret || authz !== `Bearer ${config.cronSecret}`) {
    return new Response("Unauthorized", { status: 401 })
  }

  const users = await prisma.user.findMany({ select: { id: true } })
  for (const u of users) {
    try {
      await summarizePending(u.id)
      await syncUser(u.id)
    } catch {}
  }
  return Response.json({ ok: true, users: users.length })
}
