import type { Metadata } from "next"
import { DM_Serif_Display, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { Providers } from "./providers"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        fontSerif.variable,
        "font-sans"
      )}
    >
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
