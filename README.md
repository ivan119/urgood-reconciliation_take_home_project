# URGOOD Weekly Payout Reconciliation System

A full-stack mini settlement system that ingests a CSV of restaurant reservations, calculates
weekly payout cycles with rollover logic, and exposes restaurant invoices and creator payout
summaries through a server-side API and a navigation UI.

---

## How to Run Locally

**Prerequisites:** Node.js 20+, npm

### 1) Configure environment

Create a local env file (not committed) with your Postgres URLs:

```bash
# .env (or .env.local)
# Used by the app runtime (pooler is fine here)
DATABASE_URL="postgresql://..."

# Used by Prisma CLI for migrations/db push (direct, non-pgbouncer)
DIRECT_URL="postgresql://..."
```

### 2) Install, create tables, run

```bash
# 1. Install dependencies
npm install

# 2. Create tables from schema (fastest for dev)
npx prisma db push

# 3. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Click **"Parse External CSV & Seed Engine"** on the dashboard to ingest the CSV and compute all
cycle ledgers. This runs the `POST /api/admin/seed` endpoint which:
- Purges existing data
- Reads `server/assets/urgood_reservations.csv` through Nitro storage.
- Inserts all 500 reservations
- Computes payout states per (creator, restaurant) pair chronologically, with rollover

```bash
# Run unit tests
npm test
```

---

## Tech Stack & Why

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Nuxt 4 (Vue 3 + Nitro) | Full-stack in one repo — server API routes and the frontend live together with no extra setup |
| **ORM** | Prisma 7 | Type-safe queries; uses Prisma 7 `prisma.config.ts` and an adapter-based client setup |
| **Database** | PostgreSQL (Supabase-compatible) | Works locally and in deployment environments; `DIRECT_URL` is used for CLI operations |
| **Styling** | Vanilla CSS (CSS custom properties) | No build tooling dependency, full control over the design system without Tailwind purge complexity |
| **Testing** | Vitest | Native ESM support, no transpilation needed, compatible with the same TypeScript config the app uses |
| **CSV parsing** | `csv-parse/sync` | Robust, handles edge cases (quotes, CRLF), a de-facto standard in the Node ecosystem |

---

## Tradeoffs Made

1. **Seeding via HTTP POST instead of a CLI script** — keeps the workflow browser-accessible and avoids
   Node/ESM compatibility issues with running server-side Prisma code outside the Nitro runtime. Tradeoff:
   the seed is re-runnable (idempotent), not protected by auth, so it must not be exposed in production.

2. **Fees computed on period activity only, not on totalAmount (including rollover)** — URGOOD fees
   (`$0.50/cover + 10% of creator payout`) and Stripe fees are calculated against the current cycle's
   earned amount, not the accumulated carried-forward total. This avoids charging fees twice on rolled-over
   amounts. The restaurant still sees the fee line on every invoice regardless of whether the creator's
   payout threshold was met.

3. **Rollover-only cycles recorded** — if a creator-restaurant pair had no new activity in a cycle but
   still had a positive rollover balance, a `PayoutState` record is written with `periodAmount = 0` so
   the carry-forward is visible in the ledger and can clear on a future cycle. Alternative: only record
   active pairs and compute rollover lazily at query time — simpler schema, more complex read logic.

4. **`Math.round()` rounding** — used for all sub-cent results (10% of payout, 1.5% Stripe fee).
   Standard half-up rounding is deterministic and consistent. Banker's rounding was considered but adds
   complexity with negligible benefit at this scale.

---

## Assumptions

1. **Cycle boundary is inclusive at start, exclusive at end** — a dining_at exactly equal to Monday
   05:00:00 UTC belongs to the *new* cycle. The function subtracts 5 hours before computing week
   boundaries, then adds them back.

2. **`per_cover_rate` in the CSV is a dollar value** (e.g. `"8.00"`) — multiplied by 100 and rounded to
   get integer cents. If the CSV ever changes to storing cents directly, this conversion must be removed.

3. **Fees are charged immediately on covered activity** — the restaurant owes `$0.50/cover + 10% payout`
   for every cycle regardless of whether the creator's balance crossed the $25 threshold. This matches the
   most natural reading of the spec ("charged to restaurant: $0.50 per verified cover").

4. **Creator-restaurant pairing** — rollover tracks the (creator_id, restaurant_id) pair, not just the
   creator. A creator working two restaurants has independent rollover balances per restaurant. This matches
   the spec: "payouts accumulate by creator + restaurant pair."

5. **Non-verified reservations are fully excluded** — `canceled`, `no_show`, and `disputed` records are
   read into the `Reservation` table for auditability but produce zero payout calculations.

---

## What I Would Improve With More Time

1. **Streaming CSV ingestion** — the current seed loads the entire CSV into memory. For large files, a
   streaming parser piped into batched Prisma `createMany` calls would be more scalable.

2. **Cycle list query optimization** — `GET /api/cycles` does a `SELECT DISTINCT cycleStartDate` which
   works but would benefit from a dedicated `Cycle` model or a database view for larger datasets.

3. **Proper error boundaries in the UI** — currently errors fall back to a JS `alert()`. A real error
   component with contextual messaging and retry would be production-appropriate.

4. **Authentication on the seed endpoint** — `POST /api/admin/seed` is unprotected. Even a simple
   secret-token check via a request header would prevent accidental or malicious re-seeding in production.

5. **Vercel / production deployment** — the SQLite adapter works locally; production deployment would need
   a connection string swap to Postgres (Neon, Supabase, or PlanetScale) via `DATABASE_URL`.

6. **Pagination on invoice/payout endpoints** — with 500 reservations and many creator-restaurant pairs,
   API responses can grow large. Cursor-based pagination on `GET /api/cycles/:id/invoices` would help.

---

## Deploying to Vercel (Production)

Provision a hosted PostgreSQL database (e.g. Supabase / Neon) and set env vars in your hosting platform:

### 1. Provision a PostgreSQL Database
- Create a free instance on [Neon](https://neon.tech/) or [Supabase](https://supabase.com/).
- Grab your **Connection String** (begins with `postgresql://`).

### 2. Configure Your Vercel Project
- Add environment variables:
  - `DATABASE_URL` (runtime; a pooler URL is OK)
  - `DIRECT_URL` (CLI; direct connection is recommended)

### 3. Create tables
Run `npx prisma db push` (or migrations, if you create them) against your remote database, then deploy.
