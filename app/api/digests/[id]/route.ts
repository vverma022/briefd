import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getDigestById } from "@/app/api/_shared/digests"
import { updateDigestSchema } from "@/shared/schemas"

export const runtime = "nodejs"

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/digests/[id]">
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await ctx.params
  const digest = await getDigestById(session.user.id, id)
  if (!digest) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
  return Response.json(digest)
}

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/digests/[id]">
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const { id } = await ctx.params
  const parsed = updateDigestSchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json({ error: "Invalid body" }, { status: 400 })
  }
  // updateMany + userId filter so a user can't touch another user's digest.
  const { count } = await prisma.digest.updateMany({
    where: { id, userId: session.user.id },
    data: parsed.data,
  })
  if (count === 0) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
  return Response.json({ ok: true })
}
