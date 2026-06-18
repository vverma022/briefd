import { google, gmail_v1 } from "googleapis"
import { convert } from "html-to-text"

export function gmailClient(accessToken: string): gmail_v1.Gmail {
  const oauth2 = new google.auth.OAuth2()
  oauth2.setCredentials({ access_token: accessToken })
  return google.gmail({ version: "v1", auth: oauth2 })
}

// List message ids from a sender newer than the given epoch-seconds cutoff.
export async function listSenderMessageIds(
  accessToken: string,
  senderEmail: string,
  afterEpochSeconds: number,
  max = 5
): Promise<string[]> {
  const gmail = gmailClient(accessToken)
  const res = await gmail.users.messages.list({
    userId: "me",
    q: `from:${senderEmail} after:${afterEpochSeconds}`,
    maxResults: max,
  })
  return (res.data.messages ?? [])
    .map((m) => m.id)
    .filter((id): id is string => Boolean(id))
}

export type FetchedMessage = {
  gmailMessageId: string
  gmailThreadId?: string
  subject: string
  internalDate: number // epoch ms
  rawText: string
}

function decodeBody(data?: string | null): string {
  if (!data) return ""
  return Buffer.from(data, "base64url").toString("utf-8")
}

// Walk the MIME tree: prefer text/plain, fall back to text/html (converted).
function extractBody(part?: gmail_v1.Schema$MessagePart): {
  text: string
  isHtml: boolean
} {
  if (!part) return { text: "", isHtml: false }
  const mime = part.mimeType ?? ""
  if (mime === "text/plain" && part.body?.data) {
    return { text: decodeBody(part.body.data), isHtml: false }
  }
  if (mime === "text/html" && part.body?.data) {
    return { text: decodeBody(part.body.data), isHtml: true }
  }
  if (part.parts?.length) {
    for (const p of part.parts) {
      const plain = extractBody(p)
      if (plain.text && !plain.isHtml) return plain
    }
    for (const p of part.parts) {
      const any = extractBody(p)
      if (any.text) return any
    }
  }
  return { text: "", isHtml: false }
}

export async function getMessage(
  accessToken: string,
  id: string
): Promise<FetchedMessage> {
  const gmail = gmailClient(accessToken)
  const res = await gmail.users.messages.get({
    userId: "me",
    id,
    format: "full",
  })
  const msg = res.data
  const headers = msg.payload?.headers ?? []
  const subject =
    headers.find((h) => h.name?.toLowerCase() === "subject")?.value ??
    "(no subject)"
  const raw = extractBody(msg.payload ?? undefined)
  const text = raw.isHtml ? convert(raw.text, { wordwrap: false }) : raw.text
  return {
    gmailMessageId: msg.id ?? id,
    gmailThreadId: msg.threadId ?? undefined,
    subject,
    internalDate: Number(msg.internalDate ?? 0),
    rawText: text.trim(),
  }
}
