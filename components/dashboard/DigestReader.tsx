"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  LinkSquare02Icon,
  Bookmark02Icon,
} from "@hugeicons/core-free-icons"

import { useDigestQuery, useUpdateDigestMutation } from "@/queries/digests"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Digest } from "@/shared/types"

// Stagger the brief in: header → summary → actions.
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export function DigestReader({ initial }: { initial: Digest }) {
  const { data } = useDigestQuery(initial.id, initial)
  const digest = data ?? initial
  const update = useUpdateDigestMutation()
  const markedRef = React.useRef(false)

  React.useEffect(() => {
    if (!markedRef.current && !digest.isRead) {
      markedRef.current = true
      update.mutate({ id: digest.id, input: { isRead: true } })
    }
  }, [digest.id, digest.isRead, update])

  const gmailUrl = `https://mail.google.com/mail/u/0/#inbox/${
    digest.gmailThreadId ?? digest.gmailMessageId
  }`

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex max-w-2xl flex-col gap-6 py-2"
    >
      <Link
        href="/dashboard"
        className="flex w-fit items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-foreground/50 uppercase transition-colors hover:text-foreground"
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={14} strokeWidth={2} />
        Back
      </Link>

      <motion.div variants={item} className="flex flex-col gap-3">
        <span className="font-mono text-[10px] tracking-[0.3em] text-foreground/40 uppercase">
          {digest.senderName ?? digest.senderEmail}
        </span>
        <h1 className="font-serif text-3xl leading-tight text-foreground italic sm:text-4xl">
          {digest.summary?.title ?? digest.subject}
        </h1>
        {digest.summary ? (
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] tracking-[0.2em] text-foreground/40 uppercase">
            <Badge variant="secondary">{digest.summary.tone}</Badge>
            <span>{digest.summary.readingTimeMinutes} min read</span>
          </div>
        ) : null}
      </motion.div>

      <motion.div variants={item} className="flex flex-col gap-6">
        {digest.summary ? (
          <>
            <p className="font-sans text-base leading-relaxed font-light text-foreground/80">
              {digest.summary.tldr}
            </p>
            <ul className="flex flex-col gap-3 border-t border-foreground/10 pt-6">
              {digest.summary.takeaways.map((t, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-sans text-sm leading-relaxed font-light text-foreground/75"
                >
                  <span className="font-mono text-xs text-foreground/30">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="font-mono text-[11px] tracking-[0.2em] text-foreground/50 uppercase">
            Summarizing… this brief will fill in shortly.
          </p>
        )}
      </motion.div>

      <motion.div
        variants={item}
        className="flex flex-wrap items-center gap-3 border-t border-foreground/10 pt-6"
      >
        <Button asChild variant="silver" size="lg">
          <a href={gmailUrl} target="_blank" rel="noopener noreferrer">
            <HugeiconsIcon icon={LinkSquare02Icon} strokeWidth={2} />
            View original
          </a>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() =>
            update.mutate({
              id: digest.id,
              input: { isSaved: !digest.isSaved },
            })
          }
        >
          <HugeiconsIcon
            icon={Bookmark02Icon}
            strokeWidth={2}
            className={cn(digest.isSaved && "text-foreground")}
          />
          {digest.isSaved ? "Saved" : "Save"}
        </Button>
      </motion.div>
    </motion.article>
  )
}
