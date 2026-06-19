import * as React from "react"

import { cn } from "@/lib/utils"

export function LegalSection({
  index,
  kicker,
  title,
  children,
}: {
  index: string
  kicker: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="grid grid-cols-1 gap-5 border-t border-foreground/10 py-10 md:grid-cols-[180px_1fr] md:gap-10">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
          {index} / {kicker}
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="font-serif text-2xl leading-tight text-foreground italic sm:text-3xl">
          {title}
        </h2>
        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </section>
  )
}

export function P({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p
      className={cn(
        "max-w-2xl font-sans text-sm leading-relaxed font-light text-foreground/70",
        className
      )}
    >
      {children}
    </p>
  )
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="flex max-w-2xl flex-col gap-2.5">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 font-sans text-sm leading-relaxed font-light text-foreground/70"
        >
          <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function MailLink({ email }: { email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="font-mono text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {email}
    </a>
  )
}
