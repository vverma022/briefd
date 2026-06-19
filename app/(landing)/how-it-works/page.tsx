import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  BookOpen01Icon,
  Mail01Icon,
  Notification03Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

import { FlowDiagram } from "@/components/pages/FlowDiagram"
import { PageShell } from "@/components/pages/PageShell"
import { Bullets, P } from "@/components/pages/Prose"

export const metadata: Metadata = {
  title: "How it works — Briefd",
  description:
    "Connect Gmail read-only, tag the newsletters you care about, and let Claude turn each issue into a three-line brief pushed to your phone.",
}

type Step = {
  index: string
  tag: string
  title: string
  body: string
  icon: IconSvgElement
}

const steps: Step[] = [
  {
    index: "01",
    tag: "Connect",
    title: "Connect Gmail",
    body: "Sign in with Google and grant Briefd read-only access. We never send, delete, or modify anything in your inbox — we only read the messages you ask us to watch.",
    icon: Mail01Icon,
  },
  {
    index: "02",
    tag: "Tag senders",
    title: "Pick your newsletters",
    body: "Tag the senders you actually read. Everything else in Gmail stays exactly where it is and is never opened, scanned, or stored.",
    icon: BookOpen01Icon,
  },
  {
    index: "03",
    tag: "Summarize",
    title: "Claude distills it",
    body: "When a watched newsletter lands, Claude strips the HTML noise and returns a clean title, a three-line TL;DR, and the key takeaways.",
    icon: SparklesIcon,
  },
  {
    index: "04",
    tag: "Notify",
    title: "Get briefed",
    body: "A push notification arrives the second your brief is ready — on iOS and Android, even with the app closed. One card, one tap to the original if you want it.",
    icon: Notification03Icon,
  },
]

export default function HowItWorksPage() {
  return (
    <PageShell
      eyebrow="How it works / Inbox to brief"
      title={
        <>
          Four steps from inbox <span className="silver-text">to brief.</span>
        </>
      }
      intro="Briefd sits quietly between your inbox and your attention. Here's exactly what happens, end to end."
    >
      <div className="mb-8 flex flex-col gap-4">
        <span className="font-mono text-[10px] tracking-[0.5em] text-foreground/40 uppercase">
          The pipeline
        </span>
        <FlowDiagram />
      </div>

      <div className="grid grid-cols-1 border-t border-l border-foreground/10 md:grid-cols-2">
        {steps.map((step) => (
          <article
            key={step.index}
            className="bento-card group flex min-h-[260px] flex-col justify-between border-r border-b border-foreground/10 p-7"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
                {step.index} / {step.tag}
              </span>
              <HugeiconsIcon
                icon={step.icon}
                size={20}
                strokeWidth={1.5}
                className="text-foreground/30 transition-colors group-hover:text-foreground"
              />
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="font-serif text-3xl leading-none text-foreground italic">
                {step.title}
              </h2>
              <p className="font-mono text-[12px] leading-relaxed tracking-wide text-foreground/50">
                {step.body}
              </p>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-2xl border border-foreground/10 p-7">
          <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
            What Briefd touches
          </span>
          <Bullets
            items={[
              "Read-only access to the newsletter senders you explicitly tag",
              "The contents of those specific emails, to generate a summary",
              "Your email address, used to sign you in and notify you",
            ]}
          />
        </div>
        <div className="flex flex-col gap-4 rounded-2xl border border-foreground/10 p-7">
          <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
            What it never does
          </span>
          <Bullets
            items={[
              "Send, reply to, delete, or modify any message",
              "Read mail from senders you haven't tagged",
              "Sell, share, or use your data for advertising",
            ]}
          />
        </div>
      </div>

      <div className="mt-16 flex flex-col gap-4">
        <P>
          Want the specifics on Gmail permissions and how your data is handled?
          Read the{" "}
          <Link
            href="/gmail-access"
            className="font-mono text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Gmail access
          </Link>{" "}
          page and our{" "}
          <Link
            href="/privacy"
            className="font-mono text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Privacy Policy
          </Link>
          .
        </P>
      </div>
    </PageShell>
  )
}
