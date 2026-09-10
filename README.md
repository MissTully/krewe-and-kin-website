# Krewe & Kin Website

Unified **marketing site + client billing portal** for [kreweandkin.com](https://kreweandkin.com).

- `/` — existing Krewe & Kin marketing page (static HTML preserved)
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

## Key paths

| Path | Description |
|---|---|
| `public/site/index.html` | Marketing homepage (served at `/`) |
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
