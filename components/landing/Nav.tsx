import Link from "next/link"

import { BriefdLogo } from "@/components/brand/logo"
import { config } from "@/lib/config"

const links = [
  { label: "Features", href: "#features" },
  { label: "Sources", href: "#sources" },
  { label: "Reviews", href: "#reviews" },
]

export function Nav() {
  return (
    <header className="relative z-50 mx-auto flex w-[92vw] items-center justify-between py-7">
      <a href="#" aria-label="Briefd home" className="flex items-center">
        <BriefdLogo />
      </a>

      <nav className="hidden items-center gap-2 md:flex">
        <div className="flex items-center rounded-full border border-foreground/10 bg-foreground/5 p-1">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.25em] text-foreground/60 uppercase transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </div>
        {config.isDev ? (
          <Link
            href="/onboarding"
            className="silver-btn rounded-full px-6 py-3 font-mono text-[11px] font-bold tracking-[0.25em] uppercase"
          >
            Get started
          </Link>
        ) : (
          <a
            href="#join"
            className="silver-btn rounded-full px-6 py-3 font-mono text-[11px] font-bold tracking-[0.25em] uppercase"
          >
            Join waitlist
          </a>
        )}
      </nav>
    </header>
  )
}
