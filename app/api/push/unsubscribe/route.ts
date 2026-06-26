import { z } from "zod"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const bodySchema = z.object({ endpoint: z.string().url() })

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = bodySchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 })
  }

  // Scope the delete to the caller so one user can't drop another's subscription.
  await prisma.pushSubscription.deleteMany({
    where: { endpoint: parsed.data.endpoint, userId: session.user.id },
  })

  return Response.json({ ok: true })
}
