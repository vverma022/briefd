import { auth } from "@/auth"
import { listDigests } from "@/app/api/_shared/digests"

export const runtime = "nodejs"

const DEFAULT_LIMIT = 30
const MAX_LIMIT = 50

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const url = new URL(request.url)
  const isRead = url.searchParams.get("isRead")
  const isSaved = url.searchParams.get("isSaved")
  const senderEmail = url.searchParams.get("senderEmail")
  const cursor = url.searchParams.get("cursor") ?? undefined
  const limit = Math.min(
    Number(url.searchParams.get("limit")) || DEFAULT_LIMIT,
    MAX_LIMIT
  )

  const result = await listDigests({
    userId: session.user.id,
    isRead: isRead === null ? undefined : isRead === "true",
    isSaved: isSaved === null ? undefined : isSaved === "true",
    senderEmail: senderEmail?.toLowerCase() ?? undefined,
    cursor,
    limit,
  })
  return Response.json(result)
}
