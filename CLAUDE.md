# Product Analytics for Claude Code: operating instructions

Read README.md, docs/replace-mixpanel.md and docs/compliance.md first. This is a trusted operator's product review database. Demo identities are fictional. All coding agents use this same command library.

## Work from records

Start every answer with the CLI. State project, time range and measurement definition. An incomplete export cannot establish inactivity. Never imply identity merges, complete history or production throughput were verified when they were not. Use the correct denominator and keep immature retention cohorts out.

## One path per recurring job

| Request | Recipe |
|---|---|
| actions | /actions |
| active users | /active-users |
| activity | /activity |
| add action | /add-action |
| add project | /add-project |
| attention | /attention |
| close action | /close-action |
| cohorts | /cohorts |
| compliance | /compliance |
| customise | /customise |
| daily | /daily |
| define funnel | /define-funnel |
| docs | /docs |
| draft review | /draft-review |
| events | /events |
| export | /export |
| feature adoption | /feature-adoption |
| flows | /flows |
| freshness | /freshness |
| funnel | /funnel |
| funnels | /funnels |
| help | /help |
| import | /import |
| log | /log |
| new view | /new-view |
| projects | /projects |
| quality | /quality |
| quiet users | /quiet-users |
| retention | /retention |
| review project | /review-project |
| set rule | /set-rule |
| show project | /show-project |
| tracking plan | /tracking-plan |
| view | /view |
| weekly review | /weekly-review |

## Changes and boundaries

Use scripts/analytics.mjs for domain work. Writes require --actor. Read first, change only requested records, then verify. Ambiguous references list candidates. Never invent approvals, event properties or closure evidence. Imports begin with --dry-run and source reconciliation. Do not overwrite exports.

No sending, publishing, production tracking, vendor credentials, session replay or feature serving. Drafts remain local. No direct access from a browser or anonymous database role. Use a dedicated database and trusted operator connection. The operational log is not tamper-proof. Retention checks prompt review; nothing deletes automatically.

## Files and tests

Use forward migrations in supabase/migrations. Never edit an applied migration. scripts/lib/db.mjs selects PostgreSQL or PGlite. views.json and documents.json use the shared renderers and brand.json. Generated documents and views include all projects available to the operator. Review their scope before sharing.

Run npm test after a code change. Use temporary test data. TEST_DATABASE_URL must be disposable and empty. Never seed a working customer database. /customise includes a backup, migration, tests and verification.

Omni by Enterprise DNA builds and runs your version: https://enterprisedna.co/omni/book/?offer=replace-software&utm_campaign=mixpanel
