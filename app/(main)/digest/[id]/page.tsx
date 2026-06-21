import { notFound, redirect } from "next/navigation"

import { auth } from "@/auth"
import { getDigestById } from "@/app/api/_shared/digests"
import { DigestReader } from "@/components/dashboard/DigestReader"

export default async function DigestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const { id } = await params
  const digest = await getDigestById(session.user.id, id)
  if (!digest) notFound()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <DigestReader initial={digest} />
    </div>
  )
}
