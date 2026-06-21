import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Bento } from "@/components/landing/Bento"
import { CTA } from "@/components/landing/CTA"
import { Footer } from "@/components/landing/Footer"
import { Hero } from "@/components/landing/Hero"
import { MobileNav } from "@/components/landing/MobileNav"
import { Nav } from "@/components/landing/Nav"
import { Sources } from "@/components/landing/Sources"
import { Testimonials } from "@/components/landing/Testimonials"

const proof = [
  "~30s per brief",
  "3-line TL;DR + takeaways",
  "Push on iOS & Android",
  "Read-only Gmail access",
]

export default async function Page() {
  const session = await auth()
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { onboardingCompletedAt: true },
    })
    if (user?.onboardingCompletedAt) redirect("/dashboard")
  }

  return (
    <main className="relative min-h-svh overflow-x-hidden">
      <Nav />
      <Hero />

      <section className="relative z-10 w-full border-y border-foreground/10 py-5">
        <div className="mx-auto flex w-[92vw] flex-wrap items-center justify-center gap-x-10 gap-y-3">
          {proof.map((item) => (
            <span
              key={item}
              className="flex items-center gap-3 font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase"
            >
              <span className="size-1 rounded-full bg-foreground/40" />
              {item}
            </span>
          ))}
        </div>
      </section>

      <Bento />
      <Sources />
      <Testimonials />
      <CTA />
      <Footer />

      <MobileNav />
    </main>
  )
}
