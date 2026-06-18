import type { Metadata } from "next"
import Link from "next/link"

import { config } from "@/lib/config"
import { PageShell } from "@/components/pages/PageShell"
import { Bullets, LegalSection, MailLink, P } from "@/components/pages/Prose"

export const metadata: Metadata = {
  title: "Gmail access — Briefd",
  description:
    "Exactly what Gmail data Briefd accesses, why, and how it complies with the Google API Services User Data Policy Limited Use requirements.",
}

export default function GmailAccessPage() {
  return (
    <PageShell
      eyebrow="Transparency / Google data"
      title={
        <>
          What we do with your <span className="silver-text">Gmail.</span>
        </>
      }
      intro="Briefd needs to read your newsletters to summarize them — nothing more. Here's the full, honest picture of what that access means."
    >
      <LegalSection
        index="01"
        kicker="Scope"
        title="The one permission we request"
      >
        <P>
          Briefd requests a single Gmail scope:{" "}
          <span className="font-mono text-foreground">gmail.readonly</span>.
          This is read-only. It does not let Briefd send, reply to, delete,
          archive, label, or change anything in your mailbox — only read it.
        </P>
      </LegalSection>

      <LegalSection index="02" kicker="Usage" title="What we read, and why">
        <Bullets
          items={[
            "We read messages only from the senders you explicitly tag as newsletters you want briefed.",
            "We read those messages so the AI can produce a title, a three-line TL;DR, and the key takeaways.",
            "We use your email address to sign you in and to deliver notifications.",
          ]}
        />
      </LegalSection>

      <LegalSection index="03" kicker="Boundaries" title="What we never touch">
        <Bullets
          items={[
            "Mail from senders you haven't tagged — never opened, scanned, or stored.",
            "Sending, replying, deleting, or modifying anything in your inbox — we have no such permission.",
            "Attachments, contacts, or any Google data beyond the newsletters you select.",
          ]}
        />
      </LegalSection>

      <LegalSection
        index="04"
        kicker="Limited Use"
        title="Google API compliance"
      >
        <P>
          Briefd&apos;s use and transfer of information received from Google
          APIs adheres to the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. In plain terms:
        </P>
        <Bullets
          items={[
            "We use Gmail data only to provide and improve the brief feature you signed up for.",
            "We do not transfer or sell this data, and we do not use it for advertising.",
            "We do not allow humans to read your email except as needed for security, to comply with law, or with your explicit consent.",
            "Newsletter content sent to our AI provider (Anthropic) is not used to train AI models.",
          ]}
        />
      </LegalSection>

      <LegalSection
        index="05"
        kicker="Control"
        title="You're always in control"
      >
        <P>
          You can revoke Briefd&apos;s access instantly from your{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Google Account permissions
          </a>
          . Doing so immediately stops Briefd from reading any further mail.
          Deleting your account removes your stored data.
        </P>
      </LegalSection>

      <LegalSection index="06" kicker="More" title="Read the fine print">
        <P>
          The full detail lives in our{" "}
          <Link
            href="/privacy"
            className="font-mono text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Privacy Policy
          </Link>
          . Still have questions about Gmail access? Email{" "}
          <MailLink email={config.site.email} />.
        </P>
      </LegalSection>
    </PageShell>
  )
}
