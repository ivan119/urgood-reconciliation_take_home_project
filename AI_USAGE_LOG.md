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

*We will continue to append significant prompts and AI-driven design decisions or fixes here.*
