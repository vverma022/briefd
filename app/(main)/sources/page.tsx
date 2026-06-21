import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { SourcesManager } from "@/components/dashboard/SourcesManager"

export default async function SourcesPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-6 sm:py-10">
      <section className="flex flex-col gap-1.5">
        <h1 className="font-serif text-3xl text-foreground italic sm:text-4xl">
          Sources
        </h1>
        <p className="font-sans text-sm font-light text-foreground/55">
          The newsletters Briefd watches and summarizes. Add, remove, or
          discover more anytime.
        </p>
      </section>

      <SourcesManager />
    </div>
  )
}
