import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

// Selections are saved via POST /api/senders; this just marks onboarding done.
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingCompletedAt: new Date() },
  })
  return Response.json({ ok: true })
}
