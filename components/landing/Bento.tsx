import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  BookOpen01Icon,
  Mail01Icon,
  Notification03Icon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

type Feature = {
  index: string
  tag: string
  title: string
  body: string
  icon: IconSvgElement
}

const features: Feature[] = [
  {
    index: "01",
    tag: "Connect",
    title: "Connect Gmail",
    body: "Tag the senders you actually read. We watch only those — read-only access, nothing else touched.",
    icon: Mail01Icon,
  },
  {
    index: "02",
    tag: "Summarize",
    title: "AI distills it",
    body: "Claude strips the HTML noise and returns a title, a three-line TL;DR, and the key takeaways.",
    icon: SparklesIcon,
  },
  {
    index: "03",
    tag: "Notify",
    title: "Get pinged",
    body: "A push notification the second your brief is ready — even with the app closed, on iOS and Android.",
    icon: Notification03Icon,
  },
  {
    index: "04",
    tag: "Read",
    title: "Read clean",
    body: "One card: title, summary, takeaways, reading time. The full email is one tap away if you want it.",
    icon: BookOpen01Icon,
  },
]

export function Bento() {
  return (
    <section id="features" className="relative z-10 mx-auto w-[92vw] py-20">
      <div className="mb-12 flex flex-col gap-4">
        <span className="font-mono text-[10px] tracking-[0.5em] text-foreground/40 uppercase">
          How it works / Inbox to brief
        </span>
        <h2 className="max-w-2xl font-serif text-3xl leading-[0.95] text-foreground italic sm:text-5xl">
          Four steps from inbox <span className="silver-text">to brief.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 border-t border-l border-foreground/10 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <article
            key={feature.index}
            className="bento-card group flex min-h-[300px] flex-col justify-between border-r border-b border-foreground/10 p-7"
          >
            <div className="flex items-start justify-between">
              <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
                {feature.index} / {feature.tag}
              </span>
              <HugeiconsIcon
                icon={feature.icon}
                size={20}
                strokeWidth={1.5}
                className="text-foreground/30 transition-colors group-hover:text-foreground"
              />
            </div>
            <div className="flex flex-col gap-3">
              <h3 className="font-serif text-3xl leading-none text-foreground italic">
                {feature.title}
              </h3>
              <p className="font-mono text-[12px] leading-relaxed tracking-wide text-foreground/50">
                {feature.body}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
