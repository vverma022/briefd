import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { SourcesManager } from "@/components/dashboard/SourcesManager"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-6 sm:py-10">
      <section className="flex flex-col gap-1.5">
        <h1 className="font-serif text-3xl text-foreground italic sm:text-4xl">
          Settings
        </h1>
        <p className="font-sans text-sm font-light text-foreground/55">
          Signed in as {session.user.email}
        </p>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
          Sources
        </h2>
        <SourcesManager />
      </section>
    </div>
  )
}
