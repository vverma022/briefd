export const config = {
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
} as const

export type Config = typeof config
