import nodemailer, { type Transporter } from "nodemailer"

import { config } from "@/lib/config"

let transporter: Transporter | null = null

function getTransporter(): Transporter {
  if (!config.smtp.user || !config.smtp.password) {
    throw new Error(
      "SMTP credentials are missing — set SMTP_USER and SMTP_PASSWORD in .env"
    )
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: { user: config.smtp.user, pass: config.smtp.password },
    })
  }
  return transporter
}

export async function sendMail(message: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<void> {
  await getTransporter().sendMail({ from: config.smtp.from, ...message })
}
