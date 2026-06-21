import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: config.auth.secret,
  session: { strategy: "database" },
  providers: [
    Google({
      clientId: config.auth.google.id,
      clientSecret: config.auth.google.secret,
      authorization: {
        params: {
          scope:
            "openid email profile https://www.googleapis.com/auth/gmail.readonly",
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) session.user.id = user.id
      return session
    },
  },
  events: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google" || !user?.id) return
      let picture =
        (profile as { picture?: string } | undefined)?.picture ?? null
      if (!picture && account.access_token) {
        try {
          const res = await fetch(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            { headers: { Authorization: `Bearer ${account.access_token}` } }
          )
          if (res.ok) {
            picture =
              ((await res.json()) as { picture?: string }).picture ?? null
          }
        } catch {
        }
      }
      if (picture && picture !== user.image) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: picture },
        })
      }
    },
  },
})
