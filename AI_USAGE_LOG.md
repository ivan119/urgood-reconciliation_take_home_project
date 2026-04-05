# AI Usage Log

This file tracks the usage of AI tools during the development of this project, as requested by the assignment.

### Prompts and Interactions

1. **Prompt 1 (Initial Setup Planning):**
   * **User:** Requested a comprehensive architectural plan for the application using Nuxt 4, targeting Vercel deployment and exploring database options (PostgreSQL via Supabase or local SQLite) based on the provided project requirements (`Task.MD`).
   * **AI Response:** Generated a comprehensive implementation plan outlining the Nuxt 4 architecture, Prisma schema with SQLite/Postgres flexibility, fixed-precision arithmetic strategies for cents, and testing approaches using Vitest.

2. **Prompt 2 (Handling missing CSV dataset):**
   * **User:** Noted the absence of the `reservations.csv` data source and proposed proceeding with randomized mock data to establish application momentum. Specified that informed assumptions would be made regarding rollover subtotal logic and fee parsing, ensuring all decisions were well-documented.
   * **AI Response:** Acknowledged the approach, adapted the plan to implement a dynamic mock data seeder, and initialized a task tracker to manage progress.

3. **Prompt 3 (Environment Setup and Documentation):**
   * **User:** Directed the creation of the required documentation (`README.md` and `AI_USAGE_LOG.md`) and requested the initialization of the primary Nuxt 4 project workspace.
   * **AI Response:** Scaffolded the `AI_USAGE_LOG.md` and `README.md` shells, and proceeded to execute the Nuxt project initialization commands.
4. **Prompt 4 (Dependency Optimization and Log Refinement):**
   * **User:** Evaluated the initial package dependencies, correctly noting that `vue` and `vue-router` are automatically bundled within Nuxt 4. Requested an update of the `package.json` to target the `^4.4.2` environment securely and emphasized that the AI Usage Log should maintain a strictly professional and analytical tone.
   * **AI Response:** Adjusted the project dependencies to remove the redundant packages, configured the execution of a streamlined `npm install`, and refactored the prompt entries in this log to ensure appropriate professional standards.
5. **Prompt 5 (Version Control and Documentation Continuity):**
   * **User:** Instructed the initialization of a remote Git repository (`urgood-reconciliation_take_home_project`), provisioning of an appropriate `.gitignore`, and synchronization of local architecture plans into a project-level `IMPLEMENTATION.md` file for transparent cross-team tracking.
   * **AI Response:** Configured the `.gitignore`, successfully pushed the initial commit structure to the designated origin, and materialized the implementation plan into the root workspace schema before transitioning into the active data modeling phase.
6. **Prompt 6 (Streamlined Database Initialization via Module Integration):**
   * **User:** Discovered and supplied documentation for the official `@prisma/nuxt` module, instructing its usage to optimize database setup over relying on isolated `npx` CLI script invocations.
   * **AI Response:** Migrated the project configuration safely to the official Nuxt/Prisma integration pattern by adding `@prisma/nuxt` into `package.json` dependencies and enabling it within `nuxt.config.ts` modules. This ensures the framework actively maintains parity with Prisma schema migrations going forward.
7. **Prompt 7 (Prisma v7 Native Implementation):**
   * **User:** Discovered that the previously explored Nuxt module was deprecated and provided official Prisma 7 documentation (`npx prisma init`) indicating a shift towards a native Prisma 7 setup utilizing the new configuration syntax (`prisma.config.ts`).
   * **AI Response:** Rolled back the Nuxt module footprint, configured `prisma.config.ts` per the v7 API standard to resolve the CLI's `url` parameter deprecation constraint, and successfully synchronized the new schema structure directly into the local SQLite instance.
8. **Prompt 8 (Real Dataset Supplied):**
   * **User:** Uploaded the actual `urgood_reservations.csv` dataset and requested to update logs and proceed with the implementation.
   * **AI Response:** Updated the implementation plan, replacing the mock seeder approach with a real CSV parser. Updated documentation logs and proceeded with executing the database schema and ingestion logic.

*We will continue to append significant prompts and AI-driven design decisions or fixes here.*
