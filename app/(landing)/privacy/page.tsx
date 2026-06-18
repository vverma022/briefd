import type { Metadata } from "next"
import Link from "next/link"

import { config } from "@/lib/config"
import { PageShell } from "@/components/pages/PageShell"
import { Bullets, LegalSection, MailLink, P } from "@/components/pages/Prose"

export const metadata: Metadata = {
  title: "Privacy Policy — Briefd",
  description:
    "How Briefd collects, uses, and protects your data — including read-only Gmail access and AI summarization.",
}

const LAST_UPDATED = "June 19, 2026"

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow={`Legal / Updated ${LAST_UPDATED}`}
      title={
        <>
          Privacy <span className="silver-text">Policy.</span>
        </>
      }
      intro="Briefd reads only the newsletters you ask it to and never sells your data. This policy explains exactly what we collect, why, and how it's handled."
    >
      <LegalSection index="01" kicker="Scope" title="Who this covers">
        <P>
          This policy applies to Briefd (&ldquo;Briefd,&rdquo; &ldquo;we,&rdquo;
          &ldquo;us&rdquo;), the website at {config.site.url}, and the Briefd
          progressive web app. By using Briefd you agree to the practices
          described here. Briefd is operated by an individual maker based in
          India.
        </P>
      </LegalSection>

      <LegalSection
        index="02"
        kicker="Collection"
        title="Information we collect"
      >
        <Bullets
          items={[
            "Account data — your name and email address from Google Sign-In, used to identify your account and notify you.",
            "Sender selections — the newsletter senders you choose to watch.",
            "Newsletter content — the body of emails from the senders you tag, accessed read-only to generate summaries.",
            "Usage data — basic, privacy-respecting logs (e.g. errors and request timing) needed to keep the service running.",
          ]}
        />
      </LegalSection>

      <LegalSection
        index="03"
        kicker="Google data"
        title="How we use Gmail access"
      >
        <P>
          Briefd requests read-only access to Gmail. We use it solely to read
          messages from the senders you explicitly tag, so we can summarize
          them. We never send, reply to, delete, or modify any message, and we
          never read mail from senders you haven&apos;t selected.
        </P>
        <P>
          Briefd&apos;s use of information received from Google APIs adheres to
          the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Google API Services User Data Policy
          </a>
          , including the Limited Use requirements. See our{" "}
          <Link
            href="/gmail-access"
            className="font-mono text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Gmail access
          </Link>{" "}
          page for the full detail.
        </P>
      </LegalSection>

      <LegalSection index="04" kicker="Usage" title="How we use your data">
        <Bullets
          items={[
            "To generate the brief — title, TL;DR, and takeaways — for each watched newsletter.",
            "To deliver push notifications when a brief is ready.",
            "To operate, secure, and improve the service.",
            "To contact you about your account or important service changes.",
          ]}
        />
      </LegalSection>

      <LegalSection index="05" kicker="AI processing" title="AI summarization">
        <P>
          To create summaries, the content of your watched newsletters is sent
          to Anthropic&apos;s Claude API. Anthropic processes this content to
          return a summary and, per its API terms, does not use data submitted
          via the API to train its models. We share only what is needed to
          produce the brief.
        </P>
      </LegalSection>

      <LegalSection index="06" kicker="Sharing" title="What we never do">
        <Bullets
          items={[
            "We do not sell or rent your personal data or email content.",
            "We do not use your Gmail data for advertising.",
            "We do not share your data except with the infrastructure providers needed to run Briefd (e.g. hosting, email delivery, and the AI provider above), or where required by law.",
          ]}
        />
      </LegalSection>

      <LegalSection
        index="07"
        kicker="Retention"
        title="Retention &amp; deletion"
      >
        <P>
          We keep your account data and generated briefs for as long as your
          account is active. You can delete your account at any time, which
          removes your stored data. Revoking Briefd&apos;s access from your{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-foreground underline decoration-foreground/30 underline-offset-4 transition-colors hover:decoration-foreground"
          >
            Google Account permissions
          </a>{" "}
          immediately stops all further access to your inbox.
        </P>
      </LegalSection>

      <LegalSection index="08" kicker="Security" title="How we protect it">
        <P>
          Data is encrypted in transit, access is limited to what the service
          needs, and we follow reasonable safeguards to protect your
          information. No system is perfectly secure, but we take protecting
          your inbox seriously.
        </P>
      </LegalSection>

      <LegalSection index="09" kicker="Your rights" title="Your choices">
        <Bullets
          items={[
            "Access, correct, or delete your personal data.",
            "Revoke Gmail access at any time via your Google Account.",
            "Withdraw consent by deleting your account.",
            "Contact us with any privacy question or request.",
          ]}
        />
      </LegalSection>

      <LegalSection index="10" kicker="Governing law" title="Jurisdiction">
        <P>
          This policy is governed by the laws of India. Any disputes arising
          from it are subject to the exclusive jurisdiction of the courts of
          India.
        </P>
      </LegalSection>

      <LegalSection index="11" kicker="Changes" title="Updates to this policy">
        <P>
          We may update this policy as Briefd evolves. Material changes will be
          reflected by the &ldquo;updated&rdquo; date above, and where
          appropriate we&apos;ll notify you directly.
        </P>
      </LegalSection>

      <LegalSection index="12" kicker="Contact" title="Get in touch">
        <P>
          Questions about your privacy? Email{" "}
          <MailLink email={config.site.email} /> and we&apos;ll get back to you.
        </P>
      </LegalSection>
    </PageShell>
  )
}
