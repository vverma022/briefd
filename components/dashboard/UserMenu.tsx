"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { useTheme } from "@/components/theme-provider"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Settings01Icon,
  Logout01Icon,
  Moon02Icon,
} from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"

export type SidebarUser = {
  name: string | null
  email: string | null
  image: string | null
}

export function UserMenu({ user }: { user: SidebarUser }) {
  const { setTheme, resolvedTheme } = useTheme()
  const initials = (user.name ?? user.email ?? "U").slice(0, 1).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="gap-3 group-data-[collapsible=icon]:!p-0"
        >
          <Avatar className="size-7 rounded-lg">
            {user.image ? <AvatarImage src={user.image} alt="" /> : null}
            <AvatarFallback className="rounded-lg text-[10px]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col text-left">
            <span className="truncate text-xs font-medium text-foreground">
              {user.name ?? "Account"}
            </span>
            <span className="truncate text-[10px] text-foreground/50">
              {user.email}
            </span>
          </div>
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56 rounded-xl">
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.5} />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }}
        >
          <HugeiconsIcon icon={Moon02Icon} strokeWidth={1.5} />
          Toggle theme
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut({ redirectTo: "/" })}>
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.5} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
