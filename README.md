# Krewe & Kin Website

Unified **marketing site + client billing portal** for [kreweandkin.com](https://kreweandkin.com).

- `/` — existing Krewe & Kin marketing page (static HTML preserved)
- `/directory` — krewe member small-business directory
- `/clients` — client billing portal (invoices, PDFs, PayPal, admin)
- `/welcome` — same marketing content (legacy URL)

Brand: black / cream / gold · Contact: missy@kreweandkin.com

## Stack

- Next.js App Router + TypeScript + Tailwind CSS
- Marketing: static HTML under `public/site/` (rewritten to `/`)
- Portal: Supabase Auth (magic link) + Postgres schema
- PayPal Orders API (sandbox create + capture)
- PDF invoices via `@react-pdf/renderer`
- `DEMO_MODE=true` runs the portal without Supabase/PayPal

## Quick start (demo mode)

```bash
cp .env.example .env.local
# DEMO_MODE=true is fine for local UI exploration

npm install
npm run dev
```

Open:

- [http://localhost:3000](http://localhost:3000) — marketing site  
- [http://localhost:3000/clients](http://localhost:3000/clients) — client portal  
- Sign in → **Enter as client** or **Enter as admin**

## Production-ish setup (billing)

1. Create a Supabase project.
2. Run `supabase/migrations/001_schema.sql` in the SQL editor.
3. Optionally run `supabase/seed.sql` for sample clients/invoices.
4. Copy `.env.example` → `.env.local` and fill:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_APP_URL` | App origin (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role (webhooks / marking paid) |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Sandbox REST app credentials |
| `PAYPAL_API_BASE` | Default `https://api-m.sandbox.paypal.com` |
| `PAYPAL_WEBHOOK_ID` | For signature verification (stubbed) |
| `DEMO_MODE` | Set `false` when Supabase is configured |

5. In Supabase Auth, add redirect URL: `{APP_URL}/auth/callback`.
6. Promote your user to admin:

```sql
update public.profiles set role = 'admin' where email = 'missy@kreweandkin.com';
```

7. `npm run dev` (or deploy to Vercel).

## Directory listing uploads

Business owners request a listing at `/directory/request` and upload a card logo (JPG, PNG, or WebP, 4 MB max) plus an optional marketing flyer (JPG, PNG, WebP, or PDF, 4 MB max). Files are checked by their contents, not just the filename.

- On Vercel, uploads go to the `krewe-directory` Blob store (`BLOB_READ_WRITE_TOKEN` is set when that store is connected).
- Locally, with the token unset, uploads are saved under `.data/directory-submissions/` (gitignored).
- New requests stay **pending**. They do not appear on `/directory` until an admin approves them at `/directory/review` (sign in at `/clients` as an admin first).
- Approved cards show the uploaded logo. An image flyer sits beside that listing on desktop and stacks under it on a phone. A PDF flyer is linked as “View flyer”. Listings with no image keep the empty placeholder.
- The founding Krewe & Kin card uses the site logo and the Gasparilla studio flyer at `public/directory/krewe-kin-studio-flyer.jpg` beside the listing.

## Key paths

| Path | Description |
|---|---|
| `public/site/index.html` | Marketing homepage (served at `/`) |
| `src/app/directory/page.tsx` | Krewe business directory (`/directory`) |
| `src/app/directory/request/page.tsx` | Listing request form with logo/photo upload |
| `src/app/directory/review/page.tsx` | Admin review of pending listings |
| `public/directory/` | Seed listing logos (the founding Krewe & Kin card) |
| `src/app/clients/*` | Portal UI (login, dashboard, invoices, admin) |
| `src/app/api/*` | Auth, PayPal, admin APIs |
| `supabase/migrations/001_schema.sql` | profiles, clients, invoices, payments + RLS |
| `supabase/seed.sql` | Demo client + sample invoices |
| `.env.example` | Env template (no secrets) |

## PayPal flow

1. Client clicks **Pay with PayPal** on an unpaid invoice.
2. `POST /api/paypal/create-order` creates a sandbox order (or demo stub).
3. Browser redirects to PayPal approval URL (or demo capture when credentials unset).
4. `POST /api/paypal/capture-order` captures and marks the invoice paid.
5. `POST /api/paypal/webhook` stub also marks paid on `PAYMENT.CAPTURE.COMPLETED`.

## Repo notes

This repository previously held static marketing HTML only. The billing MVP from `krewe-and-kin-billing` is integrated under `/clients` so marketing and payments share one deployable Next.js app.
