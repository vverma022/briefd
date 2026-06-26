import type { Metadata, Viewport } from "next"
import { DM_Serif_Display, Geist_Mono, Inter } from "next/font/google"
import { cookies } from "next/headers"

import "./globals.css"
import { Providers } from "./providers"
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister"
import { DEFAULT_THEME, THEME_COOKIE, type Theme } from "@/lib/theme"
import { cn } from "@/lib/utils"
import { config } from "@/lib/config"

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600"],
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const fontSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
})

const siteUrl = config.site.url
const title = "Briefd — Your newsletters, briefed."
const description =
  "Connect Gmail and let AI turn every newsletter into a three-line brief, pushed to your phone the moment it lands. No inbox, no clutter."

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Briefd",
  // Installable PWA / iOS home-screen app metadata.
  appleWebApp: {
    capable: true,
    title: "Briefd",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    siteName: "Briefd",
    title,
    description,
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

// In Next.js 16, themeColor/viewport live in their own export (NOT in metadata).
// viewportFit "cover" lets the UI extend under notches and enables env(safe-area-*).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Resolve the theme server-side from the cookie so <html> ships with the
  // correct class — no flash, and no inline theme script.
  const stored = (await cookies()).get(THEME_COOKIE)?.value
  const theme: Theme =
    stored === "light" || stored === "dark" ? stored : DEFAULT_THEME

  return (
    <html
      lang="en"
      suppressHydrationWarning
      style={{ colorScheme: theme }}
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        fontSerif.variable,
        "font-sans",
        theme === "dark" && "dark"
      )}
    >
      <body>
        <ServiceWorkerRegister />
        <Providers theme={theme}>{children}</Providers>
      </body>
    </html>
  )
}
