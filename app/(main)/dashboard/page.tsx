import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { listDigests } from "@/app/api/_shared/digests"
import { DigestList } from "@/components/dashboard/DigestList"
import type { DigestListParams } from "@/services/digests"

function str(v: string | string[] | undefined): string | undefined {
  return typeof v === "string" ? v : undefined
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const sp = await searchParams
  const filter = str(sp.filter)
  const senderEmail = str(sp.senderEmail)

  const params: DigestListParams = {
    ...(filter === "unread" ? { isRead: false } : {}),
    ...(filter === "saved" ? { isSaved: true } : {}),
    ...(senderEmail ? { senderEmail } : {}),
  }

  const initial = await listDigests({
    userId: session.user.id,
    limit: 30,
    ...params,
  })

  const title =
    filter === "unread"
      ? "Unread"
      : filter === "saved"
        ? "Saved"
        : senderEmail
          ? (initial.items[0]?.senderName ?? senderEmail)
          : "All briefs"

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <h1 className="mb-6 font-serif text-3xl text-foreground italic sm:text-4xl">
        {title}
      </h1>
      <DigestList params={params} initial={initial} />
    </div>
  )
}
