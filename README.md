# URGOOD Weekly Payout Reconciliation System

A full-stack web application built to ingest reservation data, calculate weekly payout cycles, and provide summaries of restaurant invoices and creator payouts based on specific business rules.

## Tech Stack
- **Framework**: Nuxt 4 (Vue 3, Nitro)
- **Database ORM**: Prisma
- **Database**: SQLite (Development) / PostgreSQL (Production)
- **Styling**: Tailwind CSS
- **Testing**: Vitest

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```
2. Setup the Prisma database:
   ```bash
   npx prisma migrate dev
   ```
3. Run the application:
   ```bash
   npm run dev
   ```

*(This README will be expanded with architectural tradeoffs, assumptions, and future improvements as the project progresses)*
