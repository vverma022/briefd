import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Linkedin01Icon } from "@hugeicons/core-free-icons"

import { BriefdLogo } from "@/components/brand/logo"
import { ModeToggle } from "@/components/mode-toggle"
import { config } from "@/lib/config"

type FooterLink = { label: string; href: string }

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Sources", href: "/#sources" },
      { label: "Reviews", href: "/#reviews" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Gmail access", href: "/gmail-access" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-foreground/10 pb-32 md:pb-12">
      <div className="mx-auto grid w-[92vw] grid-cols-2 gap-10 py-14 md:grid-cols-5">
        <div className="col-span-2 flex flex-col gap-4">
          <BriefdLogo />
          <p className="max-w-xs font-mono text-[11px] leading-relaxed tracking-wide text-foreground/40">
            Newsletters arrive. AI summarizes. You get briefed. No inbox, no
            clutter.
          </p>
          <div className="mt-2 flex items-center gap-3">
            <a
              href={config.site.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="flex size-9 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 text-foreground/60 transition-colors hover:text-foreground"
            >
              <HugeiconsIcon
                icon={Linkedin01Icon}
                size={16}
                strokeWidth={1.5}
              />
            </a>
            <span className="mx-1 h-5 w-px bg-foreground/10" />
            <ModeToggle />
          </div>
        </div>

        {columns.map((column) => (
          <div key={column.title} className="flex flex-col gap-4">
            <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
              {column.title}
            </span>
            <ul className="flex flex-col gap-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-mono text-[12px] tracking-wide text-foreground/60 transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto flex w-[92vw] flex-col items-center justify-between gap-4 border-t border-foreground/10 pt-8 sm:flex-row">
        <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/30 uppercase">
          © 2026 Briefd
        </span>
        <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/30 uppercase">
          Newsletters → briefs, automatically
        </span>
      </div>
    </footer>
  )
}
