import { normalizeUrl } from "@/lib/utils"

export const config = {
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  // Whether public sign-up is open. When true the landing shows a "Sign up" CTA
  // (→ /onboarding → Google); when false it shows the waitlist. Open by default;
  // set NEXT_PUBLIC_SIGNUPS_OPEN=false to fall back to the waitlist. Must be a
  // NEXT_PUBLIC_ var so the client-rendered MobileNav can read it.
  signupsOpen: process.env.NEXT_PUBLIC_SIGNUPS_OPEN !== "false",
  site: {
    url: normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL, "https://briefd.app"),
    email: "vermavasu069@gmail.com",
    linkedin: "https://www.linkedin.com/in/vasu-verma-3735a2245/",
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  auth: {
    secret: process.env.AUTH_SECRET,
    url: process.env.AUTH_URL,
    google: {
      id: process.env.AUTH_GOOGLE_ID,
      secret: process.env.AUTH_GOOGLE_SECRET,
    },
  },
  ai: {
    provider: process.env.AI_PROVIDER ?? "google",
    model: process.env.AI_MODEL ?? "gemini-2.5-flash",
  },
  cronSecret: process.env.CRON_SECRET,
  push: {
    // VAPID keys for Web Push. The public key is also exposed to the client via
    // NEXT_PUBLIC_VAPID_PUBLIC_KEY; the private key is server-only.
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
    subject: process.env.VAPID_SUBJECT ?? "mailto:vermavasu069@gmail.com",
  },
  smtp: {
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT ?? 465),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM ?? "Briefd <no-reply@briefd.app>",
  },
} as const

export type Config = typeof config
