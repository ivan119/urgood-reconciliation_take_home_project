# AI Usage Log

This file tracks the usage of AI tools during the development of this project, as requested by the assignment.

## Prompts and Interactions

1. **Prompt 1 (Initial Setup Planning):**
   * **User:** Requested a comprehensive architectural plan for the application using Nuxt 4, targeting Vercel deployment and exploring database options (PostgreSQL via Supabase or local SQLite) based on the provided project requirements (`Task.MD`).
   * **AI Response:** Generated a comprehensive implementation plan outlining the Nuxt 4 architecture, Prisma schema with SQLite/Postgres flexibility, fixed-precision arithmetic strategies for cents, and testing approaches using Vitest.

1. **Prompt 2 (Handling missing CSV dataset):**
   * **User:** Noted the absence of the `reservations.csv` data source and proposed proceeding with randomized mock data to establish application momentum. Specified that informed assumptions would be made regarding rollover subtotal logic and fee parsing, ensuring all decisions were well-documented.
   * **AI Response:** Acknowledged the approach, adapted the plan to implement a dynamic mock data seeder, and initialized a task tracker to manage progress.

1. **Prompt 3 (Environment Setup and Documentation):**
   * **User:** Directed the creation of the required documentation (`README.md` and `AI_USAGE_LOG.md`) and requested the initialization of the primary Nuxt 4 project workspace.
   * **AI Response:** Scaffolded the `AI_USAGE_LOG.md` and `README.md` shells, and proceeded to execute the Nuxt project initialization commands.
1. **Prompt 4 (Dependency Optimization and Log Refinement):**
   * **User:** Evaluated the initial package dependencies, correctly noting that `vue` and `vue-router` are automatically bundled within Nuxt 4. Requested an update of the `package.json` to target the `^4.4.2` environment securely and emphasized that the AI Usage Log should maintain a strictly professional and analytical tone.
   * **AI Response:** Adjusted the project dependencies to remove the redundant packages, configured the execution of a streamlined `npm install`, and refactored the prompt entries in this log to ensure appropriate professional standards.
1. **Prompt 5 (Version Control and Documentation Continuity):**
   * **User:** Instructed the initialization of a remote Git repository (`urgood-reconciliation_take_home_project`), provisioning of an appropriate `.gitignore`, and synchronization of local architecture plans into a project-level `IMPLEMENTATION.md` file for transparent cross-team tracking.
   * **AI Response:** Configured the `.gitignore`, successfully pushed the initial commit structure to the designated origin, and materialized the implementation plan into the root workspace schema before transitioning into the active data modeling phase.
1. **Prompt 6 (Streamlined Database Initialization via Module Integration):**
   * **User:** Discovered and supplied documentation for the official `@prisma/nuxt` module, instructing its usage to optimize database setup over relying on isolated `npx` CLI script invocations.
   * **AI Response:** Migrated the project configuration safely to the official Nuxt/Prisma integration pattern by adding `@prisma/nuxt` into `package.json` dependencies and enabling it within `nuxt.config.ts` modules. This ensures the framework actively maintains parity with Prisma schema migrations going forward.
1. **Prompt 7 (Prisma v7 Native Implementation):**
   * **User:** Discovered that the previously explored Nuxt module was deprecated and provided official Prisma 7 documentation (`npx prisma init`) indicating a shift towards a native Prisma 7 setup utilizing the new configuration syntax (`prisma.config.ts`).
   * **AI Response:** Rolled back the Nuxt module footprint, configured `prisma.config.ts` per the v7 API standard to resolve the CLI's `url` parameter deprecation constraint, and successfully synchronized the new schema structure directly into the local SQLite instance.
1. **Prompt 8 (Real Dataset Supplied):**
   * **User:** Uploaded the actual `urgood_reservations.csv` dataset and requested to update logs and proceed with the implementation.
   * **AI Response:** Updated the implementation plan, replacing the mock seeder approach with a real CSV parser. Updated documentation logs and proceeded with executing the database schema and ingestion logic.

1. **Prompt 9 (Consolidating the Financial Engine):**
   * **User:** Requested the final implementation of the cent-based arithmetic logic, cycle boundary calculation (Monday 5 AM UTC), fee engine, and recursive rollover persistence logic within a pure TypeScript module.
   * **AI Response:** Developed `server/utils/billing.ts`, utilizing UTC-safe date manipulation to ensure strict cycle boundaries and integer-only math for the payout threshold ($25.00), URGOOD fees, and Stripe fees.

1. **Prompt 10 (Debugging Nuxt/Prisma Runtime + Config Errors):**
   * **User:** Reported runtime failures when booting Nuxt with Prisma, plus Prisma config issues across versions.
   * **AI Response:** Implemented a Prisma singleton pattern using `globalThis` to prevent multiple instance initialization during HMR. Migrated configuration to Prisma 7’s `prisma.config.ts` model and updated runtime setup to use an adapter-based Prisma client (PostgreSQL via `@prisma/adapter-pg`).

1. **Prompt 11 (Real-World CSV Ingestion and Reconciliation):**
   * **User:** Prompted for the delivery of the `POST /api/admin/seed` handler to process the 500-record CSV dataset into the persistence layer.
   * **AI Response:** Implemented a robust ingestion route using `csv-parse/sync`, mapping raw record identifiers to the Prisma schema, and executing a chronological calculation pass to build the `PayoutState` ledger while correctly managing cross-cycle rollovers.

1. **Prompt 12 (Frontend Dashboard & Visual Fidelity):**
   * **User:** Requested a premium-looking dashboard that allows navigation between settlement cycles and displays detailed breakdowns of invoices and payouts.
   * **AI Response:** Built a multi-page Vue 3 interface utilizing Nuxt 4's new feature set, implementing a custom CSS design system with a dark-mode aesthetic, interactive cards, and tabbed navigation for a clean User Experience.

1. **Prompt 13 (Final Polish & Code Review Fixes):**
   * **User:** Requested a final review of the codebase.
   * **AI Response:** Executed a comprehensive code review, identified several UX issues (misleading labels, missing loading states), and submission blockers (missing test config). Remedied these by updating the `vitest.config.ts`, fixing logical bugs in the UI, and expanding the `README.md` to satisfy all project requirements.

1. **Prompt 14 (Mobile Responsiveness & Final Polish):**
   * **User:** Requested a mobile-friendly layout for the dashboard after noting UI truncation and horizontal scrolling issues on handsets.
   * **AI Response:** Implemented a tailored responsive design system in `main.css`, utilizing media queries and utility classes to stack dashboard cards and summary statistics vertically on small viewports while ensuring all financial data remains legible and balanced.

## Where AI was wrong (Critical Reflections)

* **Prisma Module Depreciation:** AI initially suggested `@prisma/nuxt` which was deprecated/troublesome for Nuxt 4. Had to pivot back to a native implementation.
* **ESM Circular Dependencies:** AI code for the Prisma client didn't initially account for Nuxt's server-side environment nuances, leading to runtime failures that required manual refactoring into a singleton pattern.
* **Path Resolution:** AI assumed `@` aliases in `vitest`, which aren't automatically resolved in a standalone vitest environment without explicit configuration. Fixed by creating a explicit `vitest.config.ts`.
* **Logical UX Errors:** AI initially produced a badge label that incorrectly stated "Defers > $25" for records below the threshold. This was caught and corrected to "Below $25" during final verification.
* **UI Layout Assumptions:** AI initially assumed a fixed-width grid which broke on mobile viewports. Manual intervention was needed to move inline styles into a responsive CSS system to ensure cross-device consistency.

*AI tools were invaluable for boilerplate generation and logical structuring, but required human oversight for environment-specific configuration, mobile UX refinement, and business logic edge-cases.*
