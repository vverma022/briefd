import { config } from "@/lib/config"

type Email = { subject: string; html: string; text: string }

// Waitlist confirmation email. Built on the Cerberus fluid pattern (the de-facto
// standard for transactional email): a 600px centered container with Outlook
// (MSO) conditionals, a <style> block for mobile + dark-mode retention, and
// inline styles on every element for clients that strip <style>. Mirrors the
// Briefd brand — obsidian surface, the three-bar mark, mono uppercase labels,
// an editorial serif headline.
export function waitlistWelcomeEmail(): Email {
  // Fall back to the real domain for local/dev sends so test emails never show
  // "localhost:3000" in the footer.
  const rawUrl = config.site.url
  const url = /localhost|127\.0\.0\.1/.test(rawUrl)
    ? "https://briefd.app"
    : rawUrl
  const host = url.replace(/^https?:\/\//, "").replace(/\/$/, "")

  // Resolved hex equivalents of the obsidian theme (email clients don't render
  // oklch/gradients reliably). Soft near-black, not pure #000 which reads flat.
  const bg = "#08080a"
  const surface = "#101013"
  const hairline = "rgba(255,255,255,0.08)"
  const silver = "#f8fafc"
  const body = "#c2c6cd"
  const muted = "#8f939b"
  const faint = "#5c6068"

  const mono =
    "'SF Mono','Geist Mono',ui-monospace,'Menlo','Consolas',monospace"
  const sans = "-apple-system,'Segoe UI','Inter',Helvetica,Arial,sans-serif"
  const serif = "'Georgia','Times New Roman',serif"

  // The three-bar Briefd mark, rebuilt from table cells (renders without SVG /
  // image support); hairline border keeps it visible under forced color modes.
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

  // A single "what happens next" row: numbered badge + title + supporting line.
  const step = (n: string, title: string, copy: string) => `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
      <tr>
        <td width="30" valign="top">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="28" style="width:28px;height:28px;border:1px solid rgba(255,255,255,0.16);border-radius:14px;">
            <tr><td align="center" valign="middle" style="font-family:${mono};font-size:11px;color:${silver};height:28px;">${n}</td></tr>
          </table>
        </td>
        <td valign="top" style="padding-left:16px;">
          <div style="font-family:${sans};font-size:14px;font-weight:600;color:#e7e9ec;">${title}</div>
          <div style="font-family:${sans};font-size:13px;line-height:1.55;color:${muted};padding-top:3px;">${copy}</div>
        </td>
      </tr>
    </table>`

  const sp = (h: number) =>
    `<tr><td style="height:${h}px;line-height:${h}px;font-size:0;">&nbsp;</td></tr>`

  const hr = `<tr><td style="border-top:1px solid ${hairline};font-size:0;line-height:0;">&nbsp;</td></tr>`

  const html = `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>You're on the Briefd waitlist</title>
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
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;color:${bg};font-size:1px;line-height:1px;">You're on the list — we'll email you the moment early access opens.</div>
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
                  <tr><td style="font-family:${mono};font-size:11px;letter-spacing:0.26em;text-transform:uppercase;color:${muted};">Waitlist confirmed</td></tr>
                  ${sp(16)}
                  <tr><td class="hero" style="font-family:${serif};font-size:33px;line-height:1.1;color:${silver};">You&rsquo;re on the list.</td></tr>
                  ${sp(18)}
                  <tr><td style="font-family:${sans};font-size:15px;line-height:1.7;color:${body};">Thanks for signing up. We&rsquo;ll reach out the moment early access opens &mdash; you&rsquo;re in line ahead of launch.</td></tr>

                  ${sp(36)}
                  ${hr}
                  ${sp(30)}

                  <!-- what happens next -->
                  <tr><td style="font-family:${mono};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${faint};">What happens next</td></tr>
                  ${sp(24)}
                  <tr><td>${step("1", "Connect Gmail", "Read-only and secure — Briefd never sends, edits, or deletes a thing.")}</td></tr>
                  ${sp(22)}
                  <tr><td>${step("2", "AI distills every newsletter", "Each issue becomes a sharp three-line brief — the signal, none of the noise.")}</td></tr>
                  ${sp(22)}
                  <tr><td>${step("3", "Pushed to your phone", "The brief lands the second the newsletter does. No inbox to wade through.")}</td></tr>

                  ${sp(36)}
                  ${hr}
                  ${sp(26)}

                  <!-- footer -->
                  <tr><td style="font-family:${mono};font-size:10px;letter-spacing:0.28em;text-transform:uppercase;color:${faint};">Read-only Gmail access &middot; No spam, ever</td></tr>
                  ${sp(14)}
                  <tr><td style="font-family:${mono};font-size:10px;letter-spacing:0.2em;text-transform:uppercase;"><a href="${url}" style="color:${muted};text-decoration:none;">${host}</a></td></tr>

                </table>
              </td>
            </tr>
          </table>

          <!-- sub-footer -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td style="height:22px;line-height:22px;font-size:0;">&nbsp;</td></tr>
            <tr><td align="center" style="font-family:${sans};font-size:11px;line-height:1.5;color:${faint};">You received this because you joined the Briefd waitlist.</td></tr>
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

  const text = [
    "BRIEFD — WAITLIST CONFIRMED",
    "",
    "You're on the list.",
    "",
    "Thanks for signing up. We'll reach out the moment early access opens —",
    "you're in line ahead of launch.",
    "",
    "WHAT HAPPENS NEXT",
    "1. Connect Gmail — read-only and secure; Briefd never sends or deletes.",
    "2. AI distills every newsletter into a sharp three-line brief.",
    "3. Pushed to your phone the second the newsletter lands.",
    "",
    "Read-only Gmail access · No spam, ever",
    host,
    "",
    "You received this because you joined the Briefd waitlist.",
  ].join("\n")

  return {
    subject: "You're on the Briefd waitlist",
    html,
    text,
  }
}
