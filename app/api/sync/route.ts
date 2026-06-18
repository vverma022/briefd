import { auth } from "@/auth"
import { syncUser } from "@/app/api/_shared/pipeline"
import { NeedsReauthError } from "@/app/api/_shared/google"

export const runtime = "nodejs"
export const maxDuration = 60

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    await syncUser(session.user.id)
    return Response.json({ ok: true })
  } catch (e) {
    if (e instanceof NeedsReauthError) {
      return Response.json(
        { error: "reconnect", message: "Reconnect Gmail to continue" },
        { status: 409 }
      )
    }
    throw e
  }
}
