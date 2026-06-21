import { config } from "@/lib/config"

type Email = { subject: string; html: string; text: string }

export type DigestEmailItem = {
  senderName: string | null
  senderEmail: string
  title: string
  tldr: string
  takeaways: string[]
}

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

export function digestEmail(args: {
  items: DigestEmailItem[]
  extraCount: number
  dashboardUrl: string
  dateLabel: string
}): Email {
  const { items, extraCount, dashboardUrl, dateLabel } = args

  const rawUrl = config.site.url
  const url = /localhost|127\.0\.0\.1/.test(rawUrl)
    ? "https://briefd.app"
    : rawUrl
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "")

  const bg = "#08080a"
  const surface = "#101013"
  const card = "#141418"
  const hairline = "rgba(255,255,255,0.08)"
  const silver = "#f8fafc"
  const body = "#c2c6cd"
  const muted = "#8f939b"
  const faint = "#5c6068"

  const mono =
    "'SF Mono','Geist Mono',ui-monospace,'Menlo','Consolas',monospace"
  const sans = "-apple-system,'Segoe UI','Inter',Helvetica,Arial,sans-serif"
  const serif = "'Georgia','Times New Roman',serif"

  const mark = `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="42" style="width:42px;height:42px;background:${bg};border:1px solid ${hairline};border-radius:11px;">
      <tr><td style="padding:13px 11px;" valign="middle">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
          <tr><td style="padding-bottom:4px;"><div style="height:3px;width:20px;background:#f8fafc;border-radius:2px;font-size:0;line-height:0;">&nbsp;</div></td></tr>
          <tr><td style="padding-bottom:4px;"><div style="height:3px;width:14px;background:#cbd5e1;border-radius:2px;font-size:0;line-height:0;">&nbsp;</div></td></tr>
          <tr><td><div style="height:3px;width:9px;background:#94a3b8;border-radius:2px;font-size:0;line-height:0;">&nbsp;</div></td></tr>
        </table>
      </td></tr>
    </table>`

  const sp = (h: number) =>
    `<tr><td style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</td></tr>`

  const hr = `<tr><td style="border-top:1px solid ${hairline};font-size:0;line-height:0;">&nbsp;</td></tr>`

  const takeawayRow = (t: string) => `
    <tr>
      <td width="14" valign="top" style="font-family:${sans};font-size:13px;line-height:1.5;color:${muted};">&bull;</td>
      <td valign="top" style="font-family:${sans};font-size:13px;line-height:1.55;color:${body};">${esc(t)}</td>
    </tr>`

  const briefCard = (item: DigestEmailItem) => {
    const sender = esc(item.senderName ?? item.senderEmail)
    const takeaways = item.takeaways
      .slice(0, 3)
      .map(takeawayRow)
      .join(
        '<tr><td colspan="2" style="height:6px;line-height:6px;font-size:0;">&nbsp;</td></tr>'
      )
    return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${card};border:1px solid ${hairline};border-radius:14px;">
      <tr><td style="padding:22px 24px;">
        <div style="font-family:${mono};font-size:10px;letter-spacing:0.24em;text-transform:uppercase;color:${muted};">${sender}</div>
        <div style="font-family:${serif};font-size:19px;line-height:1.25;color:${silver};padding-top:8px;">${esc(item.title)}</div>
        <div style="font-family:${sans};font-size:14px;line-height:1.65;color:${body};padding-top:10px;">${esc(item.tldr)}</div>
        ${
          item.takeaways.length > 0
            ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="padding-top:14px;">${takeaways}</table>`
            : ""
        }
      </td></tr>
    </table>`
  }

  const cards = items
    .map(briefCard)
    .join(
      '<tr><td style="height:14px;line-height:14px;font-size:0;">&nbsp;</td></tr>'
    )

  const count = items.length
  const countLabel = count === 1 ? "1 new brief" : `${count} new briefs`

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>Your daily brief from Briefd</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  html,body{margin:0!important;padding:0!important;height:100%!important;width:100%!important;background:${bg};}
  *{-ms-text-size-adjust:100%;-webkit-text-size-adjust:100%;}
  table,td{mso-table-lspace:0pt!important;mso-table-rspace:0pt!important;border-collapse:collapse!important;}
  a{text-decoration:none;}
  @media screen and (max-width:600px){
    .pad{padding-left:24px!important;padding-right:24px!important;}
    .hero{font-size:28px!important;}
  }
</style>
</head>
<body style="margin:0;padding:0;background:${bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;color:${bg};font-size:1px;line-height:1px;">${countLabel} from your newsletters — distilled.</div>
<center role="article" aria-roledescription="email" lang="en" style="width:100%;background:${bg};">
  <!--[if mso | IE]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${bg};"><tr><td align="center"><![endif]-->
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${bg};">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <!--[if mso | IE]><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600"><tr><td><![endif]-->
        <div style="max-width:600px;margin:0 auto;">

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;background:${surface};border:1px solid ${hairline};border-radius:18px;overflow:hidden;">

            <!-- silver accent rail -->
            <tr><td style="height:3px;line-height:3px;font-size:0;background:#cbd5e1;background-image:linear-gradient(90deg,#f8fafc 0%,#94a3b8 100%);">&nbsp;</td></tr>

            <tr>
              <td class="pad" style="padding:40px 44px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">

                  <!-- header -->
                  <tr>
                    <td>
                      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td valign="middle">${mark}</td>
                          <td valign="middle" style="padding-left:13px;font-family:${mono};font-size:13px;letter-spacing:0.4em;text-transform:uppercase;color:${silver};">Briefd</td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  ${sp(40)}

                  <!-- hero -->
                  <tr><td style="font-family:${mono};font-size:11px;letter-spacing:0.26em;text-transform:uppercase;color:${muted};">${esc(dateLabel)}</td></tr>
                  ${sp(16)}
                  <tr><td class="hero" style="font-family:${serif};font-size:33px;line-height:1.1;color:${silver};">Your daily brief.</td></tr>
                  ${sp(14)}
                  <tr><td style="font-family:${sans};font-size:15px;line-height:1.7;color:${body};">${countLabel} since your last digest &mdash; the signal, none of the noise.</td></tr>

                  ${sp(32)}

                  <!-- briefs -->
                  <tr><td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                      ${cards}
                    </table>
                  </td></tr>

                  ${
                    extraCount > 0
                      ? `${sp(18)}<tr><td style="font-family:${mono};font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:${faint};">+ ${extraCount} more ${extraCount === 1 ? "brief" : "briefs"} &mdash; read them all on the web</td></tr>`
                      : ""
                  }

                  ${sp(32)}

                  <!-- CTA button -->
                  <tr><td>
                    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                      <tr><td align="center" style="border-radius:12px;background:#f8fafc;background-image:linear-gradient(135deg,#f8fafc 0%,#94a3b8 100%);">
                        <a href="${dashboardUrl}" style="display:inline-block;padding:14px 28px;font-family:${mono};font-size:11px;font-weight:bold;letter-spacing:0.2em;text-transform:uppercase;color:#08080a;text-decoration:none;">View all on Briefd</a>
                      </td></tr>
                    </table>
                  </td></tr>

                  ${sp(36)}
                  ${hr}
                  ${sp(26)}

                  <!-- footer -->
                  <tr><td style="font-family:${mono};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${faint};">Read-only Gmail access &middot; Delivered once a day</td></tr>
                  ${sp(14)}
                  <tr><td style="font-family:${mono};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;"><a href="${url}" style="color:${muted};text-decoration:none;">${host}</a></td></tr>

                </table>
              </td>
            </tr>
          </table>

          <!-- sub-footer -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td style="height:22px;line-height:22px;font-size:0;">&nbsp;</td></tr>
            <tr><td align="center" style="font-family:${sans};font-size:11px;line-height:1.5;color:${faint};">You receive this because daily email digests are on. Manage it in Briefd settings.</td></tr>
          </table>

        </div>
        <!--[if mso | IE]></td></tr></table><![endif]-->

      </td>
    </tr>
  </table>
  <!--[if mso | IE]></td></tr></table><![endif]-->
</center>
</body>
</html>`

  const textLines = [
    "BRIEFD — YOUR DAILY BRIEF",
    dateLabel,
    "",
    `${countLabel} since your last digest.`,
    "",
  ]
  for (const item of items) {
    textLines.push(
      `— ${item.senderName ?? item.senderEmail}`,
      item.title,
      item.tldr
    )
    for (const t of item.takeaways.slice(0, 3)) textLines.push(`  • ${t}`)
    textLines.push("")
  }
  if (extraCount > 0) {
    textLines.push(`+ ${extraCount} more — read them all on the web.`, "")
  }
  textLines.push("View all on Briefd:", dashboardUrl, "", host)

  return {
    subject: `Your daily brief — ${countLabel}`,
    html,
    text: textLines.join("\n"),
  }
}
