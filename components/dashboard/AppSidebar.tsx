"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  News01Icon,
  Mail01Icon,
  Bookmark02Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { BriefdLogo } from "@/components/brand/logo"
import { useSendersQuery } from "@/queries/senders"
import { SyncButton } from "@/components/dashboard/SyncButton"
import { UserMenu, type SidebarUser } from "@/components/dashboard/UserMenu"

export function AppSidebar({ user }: { user: SidebarUser }) {
  const pathname = usePathname()
  const params = useSearchParams()
  const { data: senders } = useSendersQuery()

  const filter = params.get("filter")
  const activeSender = params.get("senderEmail")
  const onDashboard = pathname === "/dashboard"

  const briefs = [
    {
      label: "All briefs",
      icon: News01Icon,
      href: "/dashboard",
      active: onDashboard && !filter && !activeSender,
    },
    {
      label: "Unread",
      icon: Mail01Icon,
      href: "/dashboard?filter=unread",
      active: onDashboard && filter === "unread",
    },
    {
      label: "Saved",
      icon: Bookmark02Icon,
      href: "/dashboard?filter=saved",
      active: onDashboard && filter === "saved",
    },
  ]

  const activeSenders = (senders ?? []).filter((s) => s.isActive)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center justify-between gap-2 px-1 py-1">
          <Link
            href="/dashboard"
            aria-label="Briefd"
            className="group-data-[collapsible=icon]:hidden"
          >
            <BriefdLogo />
          </Link>
          <SidebarTrigger className="text-foreground/50" />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Briefs</SidebarGroupLabel>
          <SidebarMenu>
            {briefs.map((b) => (
              <SidebarMenuItem key={b.label}>
                <SidebarMenuButton
                  asChild
                  isActive={b.active}
                  tooltip={b.label}
                >
                  <Link href={b.href}>
                    <HugeiconsIcon icon={b.icon} strokeWidth={1.5} />
                    <span>{b.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sources</SidebarGroupLabel>
          <SidebarMenu>
            {activeSenders.map((s) => (
              <SidebarMenuItem key={s.id}>
                <SidebarMenuButton
                  asChild
                  isActive={activeSender === s.senderEmail}
                  tooltip={s.senderName ?? s.senderEmail}
                >
                  <Link
                    href={`/dashboard?senderEmail=${encodeURIComponent(s.senderEmail)}`}
                  >
                    <span className="truncate">
                      {s.senderName ?? s.senderEmail}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/sources"}
                tooltip="Manage sources"
              >
                <Link href="/sources">
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} />
                  <span>Manage sources</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SyncButton />
          </SidebarMenuItem>
          <SidebarMenuItem>
            <UserMenu user={user} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
