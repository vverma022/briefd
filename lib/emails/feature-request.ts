type Email = { subject: string; html: string; text: string }

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

// Internal notification email — a feature request from a signed-in user. Plain
// and scannable; this lands in the team inbox, not a customer's.
export function featureRequestEmail(args: {
  title: string
  description: string
  fromName: string | null
  fromEmail: string | null
}): Email {
  const { title, description, fromName, fromEmail } = args
  const who =
    [fromName, fromEmail].filter(Boolean).join(" · ") || "Unknown user"

  const html = `<!DOCTYPE html>
<html lang="en"><body style="margin:0;padding:24px;background:#0b0b0d;font-family:-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;color:#e7e9ec;">
  <div style="max-width:560px;margin:0 auto;background:#141418;border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:28px;">
    <div style="font-family:'SF Mono',ui-monospace,monospace;font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:#8f939b;">Feature request</div>
    <h1 style="margin:10px 0 0;font-size:20px;line-height:1.3;color:#f8fafc;">${esc(title)}</h1>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.65;color:#c2c6cd;white-space:pre-wrap;">${esc(description)}</p>
    <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:22px 0;">
    <div style="font-size:12px;color:#8f939b;">From: ${esc(who)}</div>
  </div>
</body></html>`

  const text = [
    "FEATURE REQUEST",
    "",
    title,
    "",
    description,
    "",
    `From: ${who}`,
  ].join("\n")

  return { subject: `Feature request: ${title}`, html, text }
}
