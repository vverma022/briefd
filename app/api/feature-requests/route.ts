import { auth } from "@/auth"
import { config } from "@/lib/config"
import { sendMail } from "@/lib/mailer"
import { featureRequestEmail } from "@/lib/emails/feature-request"
import { featureRequestSchema } from "@/shared/schemas"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = featureRequestSchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid body", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  await sendMail({
    to: config.site.email,
    ...featureRequestEmail({
      title: parsed.data.title,
      description: parsed.data.description,
      fromName: session.user.name ?? null,
      fromEmail: session.user.email ?? null,
    }),
  })

  return Response.json({ ok: true })
}
