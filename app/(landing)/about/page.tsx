import type { Metadata } from "next"
import { HugeiconsIcon } from "@hugeicons/react"
import { Linkedin01Icon } from "@hugeicons/core-free-icons"

import { config } from "@/lib/config"
import { PageShell } from "@/components/pages/PageShell"
import { P } from "@/components/pages/Prose"

export const metadata: Metadata = {
  title: "About — Briefd",
  description:
    "Briefd is built by Vasu, a forward deployment engineer who got tired of drowning in newsletters worth reading.",
}

const facts = [
  { label: "Maker", value: "Vasu" },
  { label: "Role", value: "Forward Deployment Engineer" },
  { label: "Building", value: "Briefd" },
]

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About / The maker"
      title={
        <>
          Built by one engineer who{" "}
          <span className="silver-text">reads too much.</span>
        </>
      }
      intro="Briefd is a small, opinionated product made by one person — not a company, not a team, not a roadmap committee."
    >
      <div className="grid grid-cols-1 divide-y divide-foreground/10 border-y border-foreground/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {facts.map((fact) => (
          <div
            key={fact.label}
            className="flex flex-col gap-2 px-6 py-6 text-center"
          >
            <span className="font-mono text-[9px] tracking-[0.4em] text-foreground/30 uppercase">
              {fact.label}
            </span>
            <span className="font-mono text-[12px] tracking-wide text-foreground/70">
              {fact.value}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-14 flex max-w-2xl flex-col gap-5">
        <P>
          Hi — I&apos;m Vasu. I work as a forward deployment engineer, which
          mostly means I sit next to the people using the software and ship the
          thing that makes their day easier. Staying sharp in that job means
          reading: product newsletters, engineering deep-dives, strategy memos,
          the lot.
        </P>
        <P>
          The problem is the reading never ends. Good newsletters pile up faster
          than anyone can keep pace with, and the &ldquo;read it later&rdquo;
          folder quietly becomes a graveyard. I didn&apos;t want a bigger inbox
          or another app to babysit — I wanted the signal without the sit-down.
        </P>
        <P>
          So I built Briefd: connect Gmail read-only, tag the senders that
          matter, and let Claude turn each issue into a three-line brief pushed
          to my phone. I get the gist in seconds and tap through to the full
          piece only when it earns it. It scratched my own itch first; now
          it&apos;s yours too.
        </P>
      </div>

      <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-foreground/10 p-7 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
            Say hi
          </span>
          <span className="font-sans text-sm font-light text-foreground/60">
            Feedback, ideas, or just to connect — I&apos;m around.
          </span>
        </div>
        <a
          href={config.site.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="silver-btn inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-mono text-[11px] font-bold tracking-[0.25em] uppercase"
        >
          <HugeiconsIcon icon={Linkedin01Icon} size={15} strokeWidth={1.8} />
          Connect on LinkedIn
        </a>
      </div>
    </PageShell>
  )
}
