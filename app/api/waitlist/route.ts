import { prisma } from "@/lib/prisma"
import { sendMail } from "@/lib/mailer"
import { waitlistWelcomeEmail } from "@/lib/emails/waitlist-welcome"
import { joinWaitlistSchema } from "@/shared/schemas"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const parsed = joinWaitlistSchema.safeParse(await request.json())
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid email", issues: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const email = parsed.data.email.trim().toLowerCase()

  // Already on the list — no record, no email. The client shows a toast.
  const existing = await prisma.waitlist.findUnique({ where: { email } })
  if (existing) {
    return Response.json({ status: "already" })
  }

  await prisma.waitlist.create({ data: { email } })

  // Fire the confirmation email, but never fail the signup over a mail error —
  // the person is on the list regardless. Log so it's visible in the server.
  try {
    await sendMail({ to: email, ...waitlistWelcomeEmail() })
  } catch (error) {
    console.error("[waitlist] failed to send confirmation email:", error)
  }

  return Response.json({ status: "joined" }, { status: 201 })
}
