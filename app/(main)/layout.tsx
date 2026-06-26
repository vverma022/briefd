import type { ReactNode } from "react"
import { Suspense } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"

import { auth } from "@/auth"
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/AppSidebar"
import { BriefdLogo } from "@/components/brand/logo"

export default async function MainLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/")

  return (
    <SidebarProvider>
      <Suspense fallback={null}>
        <AppSidebar
          user={{
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            image: session.user.image ?? null,
          }}
        />
      </Suspense>
      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b border-foreground/10 px-4 pt-[env(safe-area-inset-top)] md:hidden">
          <SidebarTrigger />
          <Link href="/dashboard" aria-label="Briefd">
            <BriefdLogo />
          </Link>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
