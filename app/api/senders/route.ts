import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { addSendersSchema } from "@/shared/schemas"
import type { SenderInput } from "@/shared/types"

export const runtime = "nodejs"

// Idempotent bulk upsert; lowercase + de-dupe input first. userId-scoped.
async function addSenders(userId: string, items: SenderInput[]) {
  const seen = new Set<string>()
  const clean = items
    .map((i) => ({
      senderEmail: i.senderEmail.trim().toLowerCase(),
      senderName: i.senderName?.trim() || null,
    }))
    .filter(
      (i) =>
        i.senderEmail && !seen.has(i.senderEmail) && seen.add(i.senderEmail)
    )

  return Promise.all(
    clean.map((i) =>
      prisma.watchedSender.upsert({
        where: { userId_senderEmail: { userId, senderEmail: i.senderEmail } },
        create: {
          userId,
          senderEmail: i.senderEmail,
          senderName: i.senderName,
        },
        update: { senderName: i.senderName ?? undefined },
      })
    )
  )
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const rows = await prisma.watchedSender.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })
  return Response.json(rows)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const parsed = addSendersSchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid body", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const items = Array.isArray(parsed.data) ? parsed.data : [parsed.data]
  const rows = await addSenders(session.user.id, items)
  return Response.json(rows, { status: 201 })
}
