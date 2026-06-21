import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { updateProfileSchema } from "@/shared/schemas"
import { getUserProfile, serializeUserProfile } from "@/app/api/_shared/profile"

export const runtime = "nodejs"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const profile = await getUserProfile(session.user.id)
  if (!profile) {
    return Response.json({ error: "Not found" }, { status: 404 })
  }
  return Response.json(profile)
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  const parsed = updateProfileSchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid body", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }
  const row = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: {
      name: true,
      email: true,
      image: true,
      digestEmailEnabled: true,
      digestDeliveryHour: true,
      digestTimezone: true,
    },
  })
  return Response.json(serializeUserProfile(row))
}
