# DMT Builders — Schedule Your Consultation

A luxury, single-link consultation booking experience for **DMT Builders, Inc.**
Clients tap a link texted to them, pick a date/time, and a real Google
Calendar event (with invite) is created automatically. Both the client and
Michael receive confirmation emails.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Prisma 7 +
SQLite, the Google Calendar API, and Resend.

---

## 1. Prerequisites

- Node.js 20+ (Node 24 was used to build this)
- A Google account (Michael's) to connect to Calendar
- A [Resend](https://resend.com) account for sending confirmation emails
- (For deployment) A [Vercel](https://vercel.com) account and a Postgres
  database — see [Deploying to Vercel](#6-deploying-to-vercel)

---

## 2. Local installation

```bash
cd dmt-builders-booking
npm install
cp .env.example .env
```

Fill in `.env` (see [Environment variables](#3-environment-variables) below —
you can leave Google/Resend blank at first and add them once you've created
those accounts in the next sections).

Create the local SQLite database:

```bash
npx prisma migrate dev
```

Run the app:

```bash
npm run dev
```

Visit **http://localhost:3000** — that's the booking page. It works
end-to-end (calendar UI, validation) even before Google/Resend are
configured; actual booking submission requires Google Calendar to be
connected (step 4).

---

## 3. Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite file path locally (`file:./dev.db`). Postgres connection string in production. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | From your Google Cloud OAuth client (step 4). |
| `GOOGLE_REDIRECT_URI` | Must exactly match an "Authorized redirect URI" on that OAuth client. |
| `RESEND_API_KEY` | From your Resend dashboard. |
| `EMAIL_FROM` | Sending address — must be on a domain verified in Resend. |
| `OWNER_EMAIL` | Where new-booking notifications are sent (Michael's inbox). |
| `ADMIN_ACCESS_TOKEN` | A long random string you make up. Gates the `/admin` page. |
| `NEXT_PUBLIC_APP_URL` | The public base URL of the deployed app. |

Generate a strong `ADMIN_ACCESS_TOKEN`:

```bash
openssl rand -hex 24
```

---

## 4. Connect Your Google Account (Calendar integration)

This authorizes the app to read Michael's Calendar availability and create
consultation events on his behalf.

### 4a. Create a Google Cloud project & OAuth credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com/) and
   create a new project (e.g. "DMT Builders Booking").
2. **APIs & Services → Library** → search **Google Calendar API** → **Enable**.
3. **APIs & Services → OAuth consent screen**:
   - User type: **External**
   - App name: `DMT Builders Booking`, support email: Michael's email
   - Scopes: you don't need to add any here manually — the app requests
     `calendar` and `userinfo.email` at connect time.
   - Test users: add Michael's Google account email (required while the
     app is in "Testing" publishing status).
4. **APIs & Services → Credentials → Create Credentials → OAuth client ID**:
   - Application type: **Web application**
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/google/callback` (local dev)
     - `https://yourdomain.com/api/auth/google/callback` (production — add
       once you know your Vercel/custom domain)
5. Copy the **Client ID** and **Client Secret** into `.env` /
   `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### 4b. Authorize the app

1. Start the app (`npm run dev` locally, or visit your deployed URL).
2. Visit:
   ```
   /admin?key=YOUR_ADMIN_ACCESS_TOKEN
   ```
   (using the value you set for `ADMIN_ACCESS_TOKEN`).
3. Click **Connect Google Calendar** and sign in with Michael's Google
   account. Approve the requested Calendar access.
4. You'll be redirected back to `/admin` showing **Connected as
   michael@...**. Bookings will now create real events on that calendar.

Keep the `/admin?key=...` link private — bookmark it for Michael only.

---

## 5. Set up Resend (confirmation emails)

1. Create an account at [resend.com](https://resend.com).
2. **Domains** → add and verify `dmtbuildersinc.com` (or the domain you'll
   send from) — follow Resend's DNS instructions.
3. **API Keys** → create a key → put it in `.env` as `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to an address on that verified domain, e.g.
   `"DMT Builders <consultations@dmtbuildersinc.com>"`.

If `RESEND_API_KEY` is left blank, the app still works — it just skips
sending emails (logged to the server console) so you can test booking
end-to-end before Resend is fully configured.

---

## 6. Deploying to Vercel

### Important: switch the database to Postgres

Vercel's serverless functions have an **ephemeral, read-only filesystem** —
a local SQLite file will not persist between requests in production. Before
deploying:

1. Provision a Postgres database (Vercel Postgres, [Neon](https://neon.tech),
   or [Supabase](https://supabase.com) all work).
2. Install the Postgres driver adapter:
   ```bash
   npm install @prisma/adapter-pg pg
   ```
3. In `prisma/schema.prisma`, change:
   ```prisma
   datasource db {
     provider = "postgresql"
   }
   ```
4. In `lib/prisma.ts`, swap the adapter:
   ```ts
   import { PrismaPg } from "@prisma/adapter-pg";
   // ...
   const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
   ```
5. Set `DATABASE_URL` (in Vercel project env vars) to your Postgres
   connection string, then run once locally against production DB:
   ```bash
   npx prisma migrate deploy
   ```

### Deploy

1. Push this project to a GitHub repository.
2. In Vercel: **Add New → Project** → import the repo.
3. Add all variables from [Environment variables](#3-environment-variables)
   in **Project Settings → Environment Variables** (use your production
   Postgres `DATABASE_URL`, real Resend key, etc.). Set
   `NEXT_PUBLIC_APP_URL` and `GOOGLE_REDIRECT_URI` to your real domain.
4. Deploy.
5. Add the production redirect URI
   (`https://yourdomain.com/api/auth/google/callback`) to the Google OAuth
   client (step 4a), then visit `/admin?key=...` on production and connect
   Google Calendar again (tokens are per-environment).

### Generating the permanent link to text clients

Once deployed, the **homepage URL itself is the booking link** — there's
nothing else to generate. For example:

```
https://dmt-builders-booking.vercel.app
```

or, once you attach a custom domain in Vercel (**Project → Settings →
Domains**):

```
https://book.dmtbuildersinc.com
```

Text that URL to clients — no login or account needed on their end.

---

## 7. Editing branding, colors, and booking rules

Everything editable lives in **`config/site.ts`** — no other code needs to
change:

- `company` — name, tagline, owner, website links, notification email
- `images.logo` / `images.heroBackground` — paths into `/public/images`;
  replace those image files to change branding art
- `colors` — the five brand colors; changing them re-themes the entire site
- `booking.workingDays` / `workingHours` / `meetingDurationMinutes` /
  `bufferMinutesBetweenMeetings` / `maxBookingsPerDay` / `bookingWindowDays`
  / `minNoticeHours` — all booking behavior

To swap the logo or hero photo, just overwrite:

```
public/images/logo.png
public/images/hero.jpg
```

---

## 8. How it works (architecture)

- `config/site.ts` — single source of truth for branding/business rules.
- `lib/availability.ts` — computes bookable slots from working hours +
  buffer + max/day (DB) + live Google Calendar freebusy.
- `lib/google.ts` — OAuth token storage/refresh and Calendar API client.
- `lib/email.ts` — Resend confirmation emails (client + owner).
- `app/api/availability` — day-level + slot-level availability endpoints.
- `app/api/book` — validates (Zod), re-checks availability (race-safe),
  creates the Calendar event, saves the booking, sends emails.
- `app/admin` — key-gated page to connect/reconnect Google Calendar.
- `prisma/schema.prisma` — `Booking` + `GoogleToken` models.

---

## 9. Troubleshooting

- **"Booking is temporarily unavailable"** — Google Calendar isn't
  connected yet. Visit `/admin?key=...` and connect it.
- **Google didn't return a refresh token on reconnect** — Google only
  issues a refresh token the first time an app is authorized (or when
  consent is forced). Remove DMT Builders' access at
  [myaccount.google.com/permissions](https://myaccount.google.com/permissions)
  and reconnect via `/admin`.
- **Times look wrong** — all booking logic is anchored to
  `config/site.ts` → `booking.timezone` (defaults to `America/Los_Angeles`)
  regardless of server timezone.
