import { Prisma } from "@prisma/client"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { encrypt } from "@/lib/crypto"
import { validateAiKey, type AiProvider } from "@/app/api/_shared/ai"
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

  const { aiApiKey, ...rest } = parsed.data
  const data: Prisma.UserUpdateInput = { ...rest }

  if (aiApiKey !== undefined || rest.aiProvider !== undefined) {
    const current = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aiProvider: true, aiApiKeyCiphertext: true },
    })

    const provider = (rest.aiProvider ??
      current?.aiProvider ??
      "default") as AiProvider

    if (provider === "default") {
      data.aiApiKeyCiphertext = null
    } else if (aiApiKey !== undefined) {
      const ok = await validateAiKey(provider, aiApiKey)
      if (!ok) {
        return Response.json(
          { error: `Could not verify your ${provider} API key.` },
          { status: 400 }
        )
      }
      data.aiApiKeyCiphertext = encrypt(aiApiKey)
    } else if (!current?.aiApiKeyCiphertext) {
      return Response.json(
        { error: `Add an API key to use ${provider}.` },
        { status: 400 }
      )
    }
  }

  const row = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      name: true,
      email: true,
      image: true,
      digestEmailEnabled: true,
      digestDeliveryHour: true,
      digestTimezone: true,
      summaryLength: true,
      aiProvider: true,
      aiApiKeyCiphertext: true,
    },
  })
  return Response.json(serializeUserProfile(row))
}
