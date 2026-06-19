import type { Metadata } from "next"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import { Linkedin01Icon, Mail01Icon } from "@hugeicons/core-free-icons"

import { config } from "@/lib/config"
import { PageShell } from "@/components/pages/PageShell"

export const metadata: Metadata = {
  title: "Contact — Briefd",
  description:
    "Get in touch with Briefd — questions, feedback, privacy requests, or just to say hi.",
}

type Channel = {
  icon: IconSvgElement
  tag: string
  title: string
  body: string
  cta: string
  href: string
  external?: boolean
}

const channels: Channel[] = [
  {
    icon: Mail01Icon,
    tag: "Email",
    title: "Drop a line",
    body: "Support, feedback, privacy requests, or anything else — email is the fastest way to reach me.",
    cta: config.site.email,
    href: `mailto:${config.site.email}`,
  },
  {
    icon: Linkedin01Icon,
    tag: "LinkedIn",
    title: "Connect",
    body: "Prefer socials? Find me on LinkedIn and send a message or connection request.",
    cta: "View profile",
    href: config.site.linkedin,
    external: true,
  },
]

export default function ContactPage() {
  return (
    <PageShell
      eyebrow="Contact / Say hello"
      title={
        <>
          Questions? <span className="silver-text">Reach out.</span>
        </>
      }
      intro="Briefd is built and run by one person, so your message reaches me directly. I read everything."
    >
      <div className="grid grid-cols-1 border-t border-l border-foreground/10 md:grid-cols-2">
        {channels.map((channel) => (
          <a
            key={channel.tag}
            href={channel.href}
            target={channel.external ? "_blank" : undefined}
            rel={channel.external ? "noopener noreferrer" : undefined}
            className="bento-card group flex min-h-[240px] flex-col justify-between border-r border-b border-foreground/10 p-7"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
                {channel.tag}
              </span>
              <HugeiconsIcon
                icon={channel.icon}
                size={20}
                strokeWidth={1.5}
                className="text-foreground/30 transition-colors group-hover:text-foreground"
              />
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="font-serif text-3xl leading-none text-foreground italic">
                {channel.title}
              </h2>
              <p className="font-mono text-[12px] leading-relaxed tracking-wide text-foreground/50">
                {channel.body}
              </p>
              <span className="mt-1 font-mono text-[11px] tracking-wide text-foreground/70 underline decoration-foreground/30 underline-offset-4 transition-colors group-hover:decoration-foreground">
                {channel.cta}
              </span>
            </div>
          </a>
        ))}
      </div>
    </PageShell>
  )
}
