export const config = {
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://briefd.app",
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
} as const

export type Config = typeof config
