"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { SessionProvider } from "next-auth/react"

import { ThemeProvider } from "@/components/theme-provider"
import { type Theme } from "@/lib/theme"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { config } from "@/lib/config"

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  if (typeof window === "undefined") return makeQueryClient()
  if (!browserQueryClient) browserQueryClient = makeQueryClient()
  return browserQueryClient
}

export function Providers({
  children,
  theme,
}: {
  children: React.ReactNode
  theme: Theme
}) {
  const queryClient = getQueryClient()

  return (
    <SessionProvider>
      <ThemeProvider initialTheme={theme}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
          {config.isDev ? <ReactQueryDevtools initialIsOpen={false} /> : null}
        </QueryClientProvider>
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
