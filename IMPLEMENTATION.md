# URGOOD Reconciliation System Implementation Plan

This plan details the technical architecture and implementation strategy for the URGOOD Weekly Payout Reconciliation System.

## Architecture Confirmed

> [!NOTE]
> The architectural plan has been approved. We are utilizing PostgreSQL (Supabase-compatible) and processing the actual `urgood_reservations.csv` file using a CSV parser. The system guarantees zero-floating-point calculations via strict cent-based integer math.

## Proposed Changes

We will build a Nuxt 4 full-stack application. We will use Prisma as our ORM to interact with a PostgreSQL database. For styling, we will use Tailwind CSS, applying a clean and robust aesthetic suitable for a dashboard.

### 1. Database and Schema Model (Prisma)

We will define the following models:

- **Reservation**: Stores all raw data from the CSV. Key fields: `id`, `dining_at`, `status`, `verified_covers`, `per_cover_rate`, `creator_id`, `restaurant_id`.
- **PayoutState** (or similar): Since rollovers persist across cycles, we need to track the accumulated balance for each `(creator_id, restaurant_id)` pair per cycle.

*Financial Precision:* All monetary amounts will be stored as **integers representing cents** (e.g., $25.00 = 2500) to ensure strict fixed-precision arithmetic and avoid floating-point errors.

### 2. Core Logic Module (Financial Rules & Cycle Logic)

We will create a pure TypeScript module (e.g., `server/utils/billing.ts`) that will be rigorously unit-tested:

- **Cycle Assignment**: A function to take a `dining_at` UTC date and map it to a Monday 5:00 AM UTC cycle boundary.
- **Eligibility**: Filter for `status === 'verified'`, ignoring `canceled`, `no_show`, `disputed`.
- **Calculations**:
  - `Creator Payout` = `verified_covers * per_cover_rate`
  - `URGOOD Fee` = `$0.50 (50 cents) * verified_covers` + `10% of Creator Payout` (with deterministic integer rounding).
  - `Stripe Fee` = `1.5% of (Creator Payout + URGOOD Fees)` (with deterministic integer rounding).
  - `Rollover Logic`: Evaluate subtotal for each (creator, restaurant) pair in a cycle. If `current + previous_unpaid > 2500` cents, mark as payable and set carried forward balance to 0. Else mark as not payable and carry forward.

### 3. Data Ingestion (CSV Importer)

We will build a Nitro API route `POST /api/admin/seed` that parses the actual `app/assets/urgood_reservations.csv` utilizing a CSV parsing library (e.g., standard `csv-parse` or similar).
It will:

1. Intercept requests to seed the database and purge existing data.
2. Read and parse the CSV securely, converting floating-point string values into fixed-precision integer cents.
3. Hydrate the PostgreSQL schema with real application data and perform accounting calculations.

### 4. API Endpoints

- `GET /api/cycles` -> Returns a list of all distinct cycles found in the data.
- `GET /api/cycles/:id/invoices?restaurant_id={optional}` -> Summaries for restaurant invoices per cycle.
- `GET /api/cycles/:id/payouts?creator_id={optional}` -> Summaries for creator payouts per cycle.

### 5. Frontend UI

- **Home / Dashboard**: An overview page that lets you select a Cycle.
- **Restaurant Invoices View**: A data table showing total creator payments, URGOOD fees, Stripe fees, and per-creator breakdowns.
- **Creator Payout Summaries**: A view showing accumulated totals, whether the threshold was met, and the payable amount vs. rolled over amount.

### 6. Tests

- We will configure **Vitest** and write unit tests for the functions in `server/utils/billing.ts`, explicitly covering:
  - The `$25` threshold logic.
  - Rollover continuation across multiple cycles.
  - Fee percentage integer math correctness.
  - Exclusion filter for non-verified records.

---

## Resolved Decisions

> [!TIP]
>
> 1. **Database Credentials**: PostgreSQL connection is provided via environment variables. Prisma CLI uses `DIRECT_URL` (direct connection) and runtime uses `DATABASE_URL` (pooler acceptable).
> 2. **CSV Parsing**: The real dataset was recovered. We will process `urgood_reservations.csv` natively.
> 3. **Rounding Bias**: We utilize standard Bank's Rounding or explicit `Math.round()` where sub-cent fractions result from calculated standard percentage metrics.

## Verification Plan

### Automated Tests

- Run `vitest run` to ensure all pure logic math functions return precise cent-based integer values across various test fixtures simulating rollover conditions and fee calculations.

### Manual Verification

- Run the seed command to ingest the CSV data.
- Spin up the development server.
- Verify in the browser that the numbers line up with manual calculations for a sample Creator + Restaurant pair.
- Ensure the UI adequately displays standard formatting for currency.
