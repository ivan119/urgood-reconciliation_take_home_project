URGOOD Weekly Payout Reconciliation System
Take-Home Project
Compensation: $250 USD upon submission
Time limit: 48 hours from when you begin
Deliverables: Live URL, source repo, README, AI usage log
Context
URGOOD connects restaurants with content creators. Creators share booking links. When
diners book and show up, the creator earns a per-cover payout funded by the restaurant. Each
week, URGOOD calculates what restaurants owe and what creators are owed.
Build a working mini version of this settlement system.
This prompt is intentionally not fully specified. We expect you to identify ambiguities, ask
clarifying questions, and document assumptions. Thoughtful questions are a positive signal.
What to Build
A web application that imports a provided CSV of 500 reservations into a real database,
calculates weekly payout cycles using the rules below, exposes logic through a server-side API,
and provides a simple UI to inspect restaurant invoices and creator payout summaries by cycle.
Deploy it to a live URL.
We care about correctness and clarity, not visual polish.
Business Rules
Cycle Assignment
Use reservation_dining_at to assign each reservation to a cycle. Cycles start Monday 5:00 AM
and end the following Monday 4:59:59 AM. Use UTC. Each reservation belongs to exactly one
cycle. Use fixed-precision arithmetic, not floating point.
Eligibility
Only reservations with status = verified are eligible for payout. Exclude canceled, no_show, and
disputed reservations.
Creator Payout
Creator payout per reservation: verified_covers × per_cover_rate
Payouts accumulate by creator + restaurant pair across cycles. If the accumulated unpaid
subtotal exceeds $25.00 in a given cycle, the full accumulated amount becomes payable. If
$25.00 or below, it rolls forward. Rollover must persist correctly across cycles.
Fees
URGOOD fees (charged to restaurant): $0.50 per verified cover + 10% of creator payout.
Stripe fee (modeled, not actual): 1.5% × (creator payout + URGOOD fees).
Restaurant Invoice
Each restaurant gets one invoice per cycle showing: total creator payments, total URGOOD
fees, total Stripe fees, grand total, and per-creator detail (covers, payout, fees).
Technical Requirements
Any backend language or framework. Any frontend. Real database required (Postgres, MySQL,
or SQLite). CSV ingestion can be a seed script or CLI import. Tests required — at minimum
cover threshold logic, rollover across cycles, fee calculations, and exclusion of non-verified
records.
Authentication, background jobs, polished design, and production hardening are not required.
README
Include a short README covering: how to run locally, stack choice and why, tradeoffs made,
assumptions, and what you would improve with more time. Keep it concise.
AI Usage Log
We expect you to use AI tools. Include a log showing: prompts used, what AI generated, what
you kept or changed, and where AI was wrong. Markdown file, chat export, screen recording, or
editor log — any format is fine.
Submission
Email ted@urgood.com with: live URL, repo link, and AI usage log.
If anything is unclear, ask before building.
