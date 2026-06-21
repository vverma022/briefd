import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { Bookmark02Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import type { Digest } from "@/shared/types"

export function DigestCard({ digest }: { digest: Digest }) {
  const title = digest.summary?.title ?? digest.subject
  const pending = digest.summarizationPending && !digest.summary

  return (
    <Link
      href={`/digest/${digest.id}`}
      className="bento-card block rounded-2xl border border-foreground/10 p-5"
    >
      <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
        {!digest.isRead ? (
          <span className="size-1.5 shrink-0 rounded-full bg-foreground" />
        ) : null}
        <span className="truncate">
          {digest.senderName ?? digest.senderEmail}
        </span>
        {digest.isSaved ? (
          <HugeiconsIcon
            icon={Bookmark02Icon}
            size={12}
            strokeWidth={2}
            className="ml-auto shrink-0 text-foreground/40"
          />
        ) : null}
      </div>

      <h3 className="mt-2 font-serif text-xl text-foreground italic">
        {title}
      </h3>

      {pending ? (
        <p className="mt-2 font-mono text-[11px] tracking-[0.2em] text-foreground/50 uppercase">
          Summarizing…
        </p>
      ) : (
        <>
          {digest.summary ? (
            <p className="mt-2 line-clamp-2 font-sans text-sm leading-relaxed font-light text-foreground/60">
              {digest.summary.tldr}
            </p>
          ) : null}
          {digest.summary ? (
            <div className="mt-3 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="font-mono text-[9px] tracking-[0.15em] uppercase"
              >
                {digest.summary.tone}
              </Badge>
              <span className="font-mono text-[10px] tracking-[0.2em] text-foreground/40 uppercase">
                {digest.summary.readingTimeMinutes} min
              </span>
            </div>
          ) : null}
        </>
      )}
    </Link>
  )
}
