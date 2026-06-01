# Briefd
> *A zero-friction newsletter digest PWA. Newsletters arrive → AI summarizes → you get pinged → you read clean.*

---

## 1. What This App Does (Plain English)

You subscribe to newsletters. They pile up in your inbox and you never read them. This app fixes that.

- You connect your Gmail account via OAuth
- You tell the app which senders are newsletters (e.g. `hello@antiswap.com`)
- When a new email arrives from that sender, a background job picks it up, strips all the HTML garbage, and sends it to Claude API for summarization
- A push notification goes to your phone
- You tap it, open a clean reading card — title, 3-line summary, key takeaways, estimated read time, and a link to the full email if you want it
- That's it. No inbox. No clutter.

---

## 2. Name Suggestions

| Name | Vibe |
|------|------|
| **Briefd** | Short for "briefed" — you're being briefed on your reading |
| **Pulp** | What's extracted from the noise |
| **Distill** | The AI distils your newsletters |
| **Folio** | Clean, editorial feel |
| **Lettrd** | Newsletter → Letter → Lettrd |
| **The Brief** | Classic, like a morning briefing |

**Recommendation: Briefd.** Short, memorable, domain-friendly, and the concept is in the name.

---

## 3. Tech Stack

### Why This Stack

You're free-tier constrained and want simplicity. Everything chosen here has a generous free tier and integrates natively.

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 14 (App Router) | API routes + frontend in one repo, Vercel-native |
| Database | MongoDB Atlas | Free M0 cluster, flexible schema for email content |
| Auth | NextAuth.js (Auth.js v5) | Gmail OAuth built-in, session management |
| Email Ingestion | Gmail API (via Google OAuth) | No forwarding tricks, direct API access |
| Background Jobs | Vercel Cron Jobs | Free tier: 2 jobs/day on hobby plan |
| AI Summarization | Claude API (claude-haiku-3) | Cheapest Claude model, fast, good enough for summaries |
| Push Notifications | Web Push API + VAPID | Native browser push, no third-party service needed |
| PWA | next-pwa (or manual service worker) | Makes it installable and offline-capable |
| Styling | Tailwind CSS | Fast to build, easy to maintain |
| Hosting | Vercel Hobby Plan | Free, auto-deploys from GitHub |

### Free Tier Reality Check

- **MongoDB Atlas M0**: 512MB storage — enough for thousands of summaries
- **Vercel Hobby**: 2 cron jobs/day, 100GB bandwidth, serverless function limits apply
- **Claude API**: Not free — but Haiku is ~$0.25 per million input tokens. A newsletter summary costs fractions of a cent. Budget: essentially $0 for personal use
- **Gmail API**: Free with OAuth, 1 billion quota units/day (you'll use maybe 100)

---

## 4. How a PWA Works in Next.js (Concept, No Code)

A PWA is just a web app with three extra things bolted on:

### 4a. The Web App Manifest
A `manifest.json` file that tells the browser "this is an installable app." It defines the app name, icons, theme color, and how it opens (fullscreen, standalone). Next.js lets you put this in the `/public` folder and link it in your root layout. When a user visits on mobile, the browser shows an "Add to Home Screen" prompt.

### 4b. The Service Worker
A JavaScript file that runs in the background, separate from the page. It does two things for you:
1. **Caches assets** so the app loads fast and works offline
2. **Listens for push events** so when your server sends a push notification, the service worker wakes up and shows it — even if the app isn't open

The library `next-pwa` wraps all of this for you automatically. You configure it in `next.config.js` and it generates the service worker on build. You don't write the service worker manually.

### 4c. Web Push Notifications
This is a three-party system:
1. **The browser** generates a unique subscription object for the user (using your VAPID public key)
2. **Your app** saves that subscription object to MongoDB
3. **Your server** (a cron job or API route) uses the `web-push` npm library to send a notification to that subscription

The notification shows up on the user's phone like any native app notification. On iOS 16.4+ this works if the user has added the PWA to their home screen.

---

## 5. Application Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        USER                             │
│   Installs PWA → Grants Gmail OAuth → Grants Push       │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                   NEXT.JS APP (Vercel)                   │
│                                                         │
│  /app (frontend)          /api (backend routes)         │
│  ├── /dashboard           ├── /auth (NextAuth)          │
│  ├── /digest/[id]         ├── /newsletters (CRUD)       │
│  └── /settings            ├── /cron/fetch-emails        │
│                           ├── /cron/summarize           │
│                           └── /push/subscribe           │
└────────────────────────┬────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼──────┐ ┌──────▼──────┐ ┌─────▼──────────┐
│  MongoDB      │ │ Gmail API   │ │  Claude API    │
│  Atlas        │ │ (Google)    │ │  (Anthropic)   │
│               │ │             │ │                │
│  users        │ │ Fetch new   │ │ Summarize      │
│  newsletters  │ │ emails from │ │ email body     │
│  digests      │ │ watched     │ │ → title        │
│  push_subs    │ │ senders     │ │ → 3-line tldr  │
└───────────────┘ └─────────────┘ │ → takeaways    │
                                  └────────────────┘
```

---

## 6. Data Models (MongoDB Collections)

### `users`
```
_id, email, name, image,
gmailAccessToken, gmailRefreshToken,
createdAt
```

### `watched_senders`
```
_id, userId,
senderEmail (e.g. "hello@antiswap.com"),
senderName (e.g. "Anti-Swap"),
isActive, createdAt
```

### `digests`
```
_id, userId, senderEmail,
originalEmailId (Gmail message ID),
originalSubject,
receivedAt,

summary: {
  title,
  tldr,           ← 2-3 sentences
  takeaways[],    ← 3-5 bullet points
  readingTimeMinutes,
  sentiment       ← optional: "motivational / analytical / story"
}

isRead, createdAt
```

### `push_subscriptions`
```
_id, userId,
subscription (the Web Push subscription object),
userAgent, createdAt
```

---

## 7. User Flow (Step by Step)

### Onboarding
1. User lands on `/` — sees a clean landing page explaining the app
2. Clicks "Get Started" → signs in with Google (Gmail OAuth via NextAuth)
3. App requests Gmail read-only scope during OAuth
4. User is taken to `/settings` where they add sender emails to watch (e.g. paste `hello@antiswap.com`)
5. User is prompted to enable push notifications → browser asks for permission → subscription saved to MongoDB

### Daily Loop (automated)
1. Vercel Cron fires every hour (or twice a day on free tier)
2. Cron hits `/api/cron/fetch-emails`
3. For each user, the API fetches new Gmail messages from watched senders using the Gmail API
4. For each new email found, the body is extracted, cleaned, and saved
5. A second step (same cron or chained) sends the cleaned body to Claude API
6. Claude returns structured summary (title, tldr, takeaways)
7. Summary saved to `digests` collection
8. Web Push notification sent to the user's subscription
9. User taps notification → opens `/digest/[id]` → reads clean card

### Reading Experience
- `/dashboard` shows all digests, newest first, grouped by sender
- Unread digests shown with a dot indicator
- `/digest/[id]` is a clean single-page reading view with no nav clutter
- "View Original" link at bottom opens the Gmail thread

---

## 8. PWA Implementation Plan (next-pwa)

### Step 1 — Install and configure next-pwa
Add `next-pwa` to the project. Wrap your `next.config.js` with the PWA config. Set `dest: 'public'` and `disable: process.env.NODE_ENV === 'development'` so the service worker only runs in production.

### Step 2 — Create manifest.json
Place in `/public/manifest.json`. Define:
- `name`: Briefd
- `short_name`: Briefd
- `display`: standalone
- `start_url`: /dashboard
- `theme_color` and `background_color`
- Icon set: 192x192 and 512x512 PNG icons

Link the manifest in your root `layout.tsx` inside the `<head>`.

### Step 3 — HTTPS
PWAs require HTTPS. Vercel gives you this for free on every deployment. Local dev uses HTTP which is fine — disable the service worker in dev mode.

### Step 4 — Push notifications setup
- Generate VAPID keys once using the `web-push` CLI tool
- Store VAPID keys in Vercel environment variables (never commit them)
- On the frontend, when user grants notification permission, call `navigator.serviceWorker.ready` then `pushManager.subscribe()` with your VAPID public key
- POST the resulting subscription object to `/api/push/subscribe`
- Save to MongoDB

### Step 5 — Install prompt
Next.js + next-pwa handles this. On mobile Chrome/Safari, once your manifest and service worker are detected, the browser surfaces an install prompt. You can also manually trigger it with the `beforeinstallprompt` event to show a custom "Add to Home Screen" button in your UI.

---

## 9. Gmail Integration Approach

### Why Gmail API over email forwarding
Email forwarding (like Meco does) means the user gets a new email address and has to set up rules. Gmail API means you connect once via OAuth and the app reads from their real inbox without changing anything.

### Scope needed
`https://www.googleapis.com/auth/gmail.readonly` — read-only, no send/delete access. This is the minimal scope and Google's consent screen will clearly show the user what you're reading.

### How fetching works
- Gmail API has a `messages.list` method that accepts a `q` parameter (same as Gmail search)
- Query: `from:hello@antiswap.com is:unread after:YYYY/MM/DD`
- Fetch message IDs, then `messages.get` each one to retrieve the full body
- Email bodies come as base64-encoded MIME — you decode and strip HTML to get plain text
- Track the last-fetched timestamp per user per sender in MongoDB so you don't re-process emails

### Token refresh
Gmail OAuth tokens expire. NextAuth stores refresh tokens. Before each Gmail API call, check if the access token is expired and use the refresh token to get a new one. Store the new access token back in MongoDB.

---

## 10. AI Summarization Approach

### Model choice
Claude Haiku (claude-haiku-3) — fastest and cheapest Claude model. A newsletter summary is ~500-1500 input tokens. At Haiku pricing that's under $0.001 per summary. Essentially free for personal use.

### Prompt strategy
Send the cleaned email body with a system prompt that instructs the model to return a JSON object with:
- `title`: A clean, descriptive title (not the email subject which is often click-baity)
- `tldr`: 2-3 sentence plain-English summary
- `takeaways`: Array of 3-5 concrete points the reader should know
- `readingTimeMinutes`: Estimated based on word count
- `tone`: One word — "motivational", "analytical", "narrative", "how-to", etc.

Ask for JSON output directly so you don't have to parse prose. Validate the JSON before saving.

### Failure handling
If the API call fails, save the raw email body and mark the digest as `summarizationPending: true`. A retry job can attempt again. Never lose an email.

---

## 11. Multi-Tenant Considerations (Future-Proofing)

Even though you're starting personal, design for multi-tenancy from day one:

- Every MongoDB document has a `userId` field — queries always filter by it
- Never query a collection without a `userId` filter in API routes
- Gmail tokens and push subscriptions are per-user
- Rate limit cron jobs per user so one power user can't hammer the Gmail API for everyone
- When you go multi-tenant, add a `plan` field to users (free/pro) and gate features like number of watched senders or summary frequency

---

## 12. Environment Variables Needed

```
# Auth
NEXTAUTH_SECRET
NEXTAUTH_URL

# Google OAuth
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

# MongoDB
MONGODB_URI

# Claude API
ANTHROPIC_API_KEY

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_EMAIL
```

---

## 13. Folder Structure

```
briefd/
├── app/
│   ├── (auth)/
│   │   └── login/
│   ├── dashboard/
│   ├── digest/[id]/
│   ├── settings/
│   └── layout.tsx
├── api/
│   ├── auth/[...nextauth]/
│   ├── cron/
│   │   ├── fetch-emails/
│   │   └── summarize/
│   ├── newsletters/
│   ├── digests/
│   └── push/
│       └── subscribe/
├── lib/
│   ├── mongodb.ts
│   ├── gmail.ts
│   ├── claude.ts
│   ├── webpush.ts
│   └── auth.ts
├── models/
│   ├── User.ts
│   ├── WatchedSender.ts
│   ├── Digest.ts
│   └── PushSubscription.ts
├── components/
│   ├── DigestCard.tsx
│   ├── SenderList.tsx
│   └── NotificationPrompt.tsx
├── public/
│   ├── manifest.json
│   ├── icons/
│   └── sw.js (generated by next-pwa)
├── vercel.json         ← cron job config
├── next.config.js
└── .env.local
```

---

## 14. Vercel Cron Config

In `vercel.json`, define the cron schedule:

```
Hobby plan: max 2 cron jobs, minimum interval every 24h
Pro plan: every minute if needed
```

For personal free use: run once a day at 7am. That's sufficient for newsletters — they rarely need real-time delivery.

If you want more frequency without paying, an alternative is to use Gmail's push notifications via Google Pub/Sub (they call it "Gmail Watch") — Gmail pings your API route the moment a new email arrives. This is more complex to set up but entirely free and instant.

---

## 15. Build Order (Recommended Sequence for Claude Code)

Build in this order to have a working app at each step:

1. **Project scaffolding** — Next.js + Tailwind + MongoDB connection + NextAuth with Google
2. **Auth flow** — Login with Google, session working, user saved to DB
3. **Settings page** — Add/remove watched senders, saved to DB
4. **Gmail fetching** — API route that fetches emails from watched senders for the logged-in user
5. **Summarization** — Claude API integration, digest saved to DB
6. **Dashboard + digest page** — Display summaries, mark as read
7. **PWA setup** — manifest.json, next-pwa, icons, installability
8. **Push notifications** — VAPID setup, subscription saving, push on new digest
9. **Cron job** — Wire fetch + summarize into automated Vercel cron
10. **Polish** — Loading states, error handling, empty states, retry logic

---

## 16. Limitations to Know Upfront

- **iOS Push**: Works only if user adds the PWA to Home Screen (iOS 16.4+). Doesn't work from Safari browser tab.
- **Vercel Hobby Cron**: One job per day maximum without paying. Work around with Gmail Watch (Pub/Sub) for real-time, or accept daily digests.
- **Gmail OAuth verification**: For production (public users), Google requires app verification for Gmail scopes. For personal use with your own Google account, you can stay in "testing" mode indefinitely.
- **Claude API costs**: Not free, but negligible for personal use. Add a monthly spend cap in the Anthropic dashboard.
- **MongoDB M0 limits**: 100 simultaneous connections, 512MB storage. Fine for hundreds of users, not thousands.