import { prisma } from "@/lib/prisma"
import { config } from "@/lib/config"

// Thrown when the Google refresh token is missing/revoked — the user must
// reconnect Gmail. Shared by the onboarding detection route and the sync
// pipeline (which is why this lives in lib, not in a single route).
export class NeedsReauthError extends Error {
  constructor(message = "Gmail reconnect required") {
    super(message)
    this.name = "NeedsReauthError"
  }
}

// Read the Google access token from the accounts row, refreshing it against
// Google's token endpoint when within ~60s of expiry. expires_at is epoch
// seconds (Google + Auth.js convention).
export async function getValidGoogleAccessToken(
  userId: string
): Promise<string> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  })
  if (!account?.refresh_token) {
    throw new NeedsReauthError("No Google refresh token on file")
  }

  const expiresAtMs = (account.expires_at ?? 0) * 1000
  if (account.access_token && expiresAtMs > Date.now() + 60_000) {
    return account.access_token
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.auth.google.id ?? "",
      client_secret: config.auth.google.secret ?? "",
      grant_type: "refresh_token",
      refresh_token: account.refresh_token,
    }),
  })
  const data = (await res.json()) as {
    access_token?: string
    expires_in?: number
    refresh_token?: string
    error?: string
  }
  if (!res.ok || !data.access_token) {
    // invalid_grant => refresh token revoked; user must reconnect Gmail.
    throw new NeedsReauthError(data.error ?? "Token refresh failed")
  }

  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: data.access_token,
      expires_at: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
      ...(data.refresh_token ? { refresh_token: data.refresh_token } : {}),
    },
  })
  return data.access_token
}
