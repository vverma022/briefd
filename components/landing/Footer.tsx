import { HugeiconsIcon } from "@hugeicons/react"
import { Linkedin01Icon, NewTwitterIcon } from "@hugeicons/core-free-icons"

import { ModeToggle } from "@/components/mode-toggle"

const columns = [
  {
    title: "Product",
    links: ["How it works", "Sources", "Install app", "Reviews"],
  },
  { title: "Company", links: ["About", "Blog", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms", "Gmail access"] },
]

export function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-foreground/10 pb-32 md:pb-12">
      <div className="mx-auto grid w-[92vw] grid-cols-2 gap-10 py-14 md:grid-cols-5">
        <div className="col-span-2 flex flex-col gap-4">
          <span className="font-mono text-sm tracking-[0.4em] text-foreground uppercase">
            Briefd
          </span>
          <p className="max-w-xs font-mono text-[11px] leading-relaxed tracking-wide text-foreground/40">
            Newsletters arrive. AI summarizes. You get briefed. No inbox, no
            clutter.
          </p>
          <div className="mt-2 flex items-center gap-3">
            {[NewTwitterIcon, Linkedin01Icon].map((icon, i) => (
              <a
                key={i}
                href="#"
                className="flex size-9 items-center justify-center rounded-full border border-foreground/10 bg-foreground/5 text-foreground/60 transition-colors hover:text-foreground"
              >
                <HugeiconsIcon icon={icon} size={16} strokeWidth={1.5} />
              </a>
            ))}
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
                <li key={link}>
                  <a
                    href="#"
                    className="font-mono text-[12px] tracking-wide text-foreground/60 transition-colors hover:text-foreground"
                  >
                    {link}
                  </a>
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
