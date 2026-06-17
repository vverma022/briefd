import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { updateSenderSchema } from "@/shared/schemas"

export const runtime = "nodejs"

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/senders/[id]">
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await ctx.params
  const parsed = updateSenderSchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 })
  }
  // updateMany + userId filter so a user can't touch another user's row.
  const { count } = await prisma.watchedSender.updateMany({
    where: { id, userId: session.user.id },
    data: { isActive: parsed.data.isActive },
  })
  if (count === 0) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
  return Response.json({ ok: true })
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/senders/[id]">
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await ctx.params
  const { count } = await prisma.watchedSender.deleteMany({
    where: { id, userId: session.user.id },
  })
  if (count === 0) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
  return Response.json({ ok: true })
}
