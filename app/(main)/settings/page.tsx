import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { getUserProfile } from "@/app/api/_shared/profile"
import { ProfileSettings } from "@/components/dashboard/ProfileSettings"

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  const profile = await getUserProfile(session.user.id)
  if (!profile) redirect("/")

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-6 sm:py-10">
      <section className="flex flex-col gap-1.5">
        <h1 className="font-serif text-3xl text-foreground italic sm:text-4xl">
          Settings
        </h1>
        <p className="font-sans text-sm font-light text-foreground/55">
          Manage your account and how Briefd reaches you.
        </p>
      </section>

      <ProfileSettings initial={profile} />
    </div>
  )
}
