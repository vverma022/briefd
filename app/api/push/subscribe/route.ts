import { z } from "zod"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

// The PushSubscription shape the browser produces (sub.toJSON()).
const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = subscriptionSchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json({ error: "Invalid subscription" }, { status: 400 })
  }

  const { endpoint, keys } = parsed.data
  // Keyed on the unique endpoint: re-subscribing the same device updates its
  // keys and re-binds it to the current user.
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: {
      userId: session.user.id,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
    update: {
      userId: session.user.id,
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  })

  return Response.json({ ok: true })
}
