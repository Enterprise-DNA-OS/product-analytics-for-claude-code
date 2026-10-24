# Product Analytics for Claude Code

Your product events, measurement rules, funnels, retention cohorts and review actions in a database you own. Start from a Mixpanel raw export and answer the questions behind the next product decision.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free, MIT. Install and run the demo. | Your event definitions, identity rules, import mapping and reports. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |

[Get your version built](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=mixpanel) · [Instead of Mixpanel](https://enterprisedna.co/omni/instead-of/mixpanel?utm_source=github&utm_medium=readme&utm_campaign=mixpanel)

## Start with a working product review

Node 20 or later.

```bash
git clone https://github.com/Enterprise-DNA-OS/product-analytics-for-claude-code.git
cd product-analytics-for-claude-code
npm install
npm run demo
npm run analytics -- funnel --project=KAURI --ref=ACTIVATION
npm run analytics -- retention --project=KAURI --days=7
npm run view
npm run docs
```

Open the folder in Claude Code, Codex, OpenCode or Cursor. Each uses CLAUDE.md and the same recipes in .claude/commands. PGlite runs locally without a database service. DATABASE_URL selects PostgreSQL. DATA_DIR selects local storage. Use a dedicated database and a trusted operator account. Never seed a working customer database.

The fictional Kauri demo has twelve events, a broken property, incomplete activation, an overdue investigation, stale tracking definitions and two projects for testing scope. Demo dates are relative to the first seed run. Repeated seed runs preserve existing data.

## The weekly work

Monday: /weekly-review joins observed usage, /quality, /attention and /freshness. Check /funnel and /retention with the measurement definitions in view. Assign /add-action, record /log and require evidence for /close-action. /draft-review writes a local draft and never sends.

The single CLI has 31 commands, each with --json. Codes match exactly without case sensitivity. Project, funnel and action references also accept partial UUIDs or case-insensitive name fragments. Ambiguous names list candidates and exit with failure. Run `npm run analytics -- help` to list options. Every write identifies its actor.

## What the numbers mean

- **Funnels:** two to five configured steps, strict increasing timestamps, one entry per distinct identity. The first occurrence of step one inside the selected date range is the entry. Later restarts do not reset that entry. Completion must be inside both the configured time window and the selected date range. Simultaneous events do not advance a funnel. Dates are UTC.
- **Retention:** exact calendar day N after the first event observed in the imported history. Only people whose Nth day is at or before --through are eligible. This is not rolling retention and not first-ever signup unless your export includes the full history. The through date is an analysis cutoff, not proof the export is complete.
- **Identity:** distinct_id values remain separate. Device IDs, anonymous IDs and logged-in IDs are not merged. Resolve the required identity mapping before comparing with a merged Mixpanel report.
- **Adoption:** distinct users of an event divided by all distinct users observed in the date range. Daily unique counts must not be added to obtain a period total.
- **Flows:** adjacent observed events per identity in timestamp order. Equal-timestamp transitions are excluded; source keys provide deterministic tie ordering. This is not a reconstructed session path.
- **Quiet and stale:** absence in an export is not proof of inactivity. Check export coverage and tracking changes first.

The base is an offline review system. It does not collect production events, replay sessions, serve feature flags or run experiments. It does not reproduce every Mixpanel dashboard or its identity engine. Mixpanel itself supports natural-language and headless analysis. The reason to use this build is control of your records and measurement rules. [Measurement and privacy checks](docs/compliance.md).

## Ten questions this build answers

These are tested questions, not unsupported claims that Mixpanel cannot answer them.

1. Which events lack the properties we agreed to collect? Run `quality`.
2. Which tracking definitions have no accountable owner? Run `tracking-plan`.
3. Where do people stop between signup, lesson start and completion? Run `funnel --ref=ACTIVATION`.
4. Which cohorts returned on the seventh day after first observed activity? Run `retention --days=7`.
5. How many distinct people used the product in this date range? Run `active-users`.
6. Which features did the observed people use? Run `feature-adoption`.
7. What event usually follows another in the imported history? Run `flows`.
8. Which identities have gone quiet for more than a week? Run `quiet-users`.
9. Which event types have stopped appearing in the export? Run `freshness`.
10. Which investigations are overdue and who owns them? Run `attention`.

## Bring your history

Obtain a raw event export from your authorised Mixpanel operator. Keep it in the ignored imports folder. No vendor credentials are needed by this importer.

```bash
npm run analytics -- add-project --code=LIVE --name="Our product" --owner="Reviewer" --purpose="Review product usage" --review-on=2027-01-01 --actor="Operator"
npm run analytics -- import mixpanel --project=LIVE --file=imports/events.jsonl --actor="Operator" --dry-run
npm run analytics -- import mixpanel --project=LIVE --file=imports/events.jsonl --actor="Operator"
```

All rows validate before commit. Matching history is skipped. Changed content under the same event identity rejects the whole batch. Full source properties are retained. Without an insert identifier, a stable full-record hash deduplicates identical records. A changed no-ID record is a new event; reconcile such files before importing.

[Export instructions, mapping and reconciliation](docs/replace-mixpanel.md). The fixture is synthetic and follows the documented raw export shape. Test a real export before adoption. Import reads the supplied file into memory; size the database and machine against the agreed volume. No production throughput claim is made.

## Documents and read-only views

Edit brand.json with your business name, logo and colours. `npm run docs` generates a measurement plan and a review action record for each project. `npm run view` generates a weekly review and a tracking-owner dashboard. These are read-only HTML snapshots, with escaped content and print styles. Outputs include all projects accessible to the trusted operator; review recipient scope before sharing them. Generated files and private imports are ignored by git.

## Your first hour: ten things to ask for

1. Put our business name and logo on the review record.
2. Test our first raw export without saving it.
3. Compare event totals and distinct identities with the source.
4. Record an owner and purpose for each event.
5. Add the properties each event must carry.
6. Define our activation steps and conversion window.
7. Agree the exact retention day and history needed.
8. Assign the missing-property investigation.
9. Draft the weekly product review.
10. Add a field for our release reference.

/customise writes and applies a forward migration after testing it on temporary data. /new-view uses the existing renderer. [What a screen adds](docs/why-no-front-end.md).

## Verification and operation

`npm test` uses temporary data and exercises every command, import conflicts and rollback, project isolation, strict funnels, mature cohorts, date validation, drafts and escaped HTML. CI runs Node 20 and 22 on Linux and Windows, plus PostgreSQL 17. A workflow definition is not a passing run; check the actual result. TEST_DATABASE_URL must name an empty disposable database.

Back up the database before changes. `export --project=LIVE --file=exports/review.json` writes all project records and source events without overwriting an existing file. This JSON archive is not a one-command database restore. Use filesystem backups with PGlite closed, or PostgreSQL backup and restore procedures, and test recovery.

## Built and run for you

Enterprise DNA brings across the agreed history, adapts the measurement rules, and builds the connections, access controls or web view your team needs. A different stack is available when it fits the workload. Omni by Enterprise DNA runs your version for one setup fee, then a retainer.

[Book 30 minutes with Sam](https://enterprisedna.co/omni/book/?offer=replace-software&utm_source=github&utm_medium=readme&utm_campaign=mixpanel).

MIT. Not affiliated with Mixpanel or Anthropic. Hosting and agent usage have their own costs. [Selection and source evidence](docs/research.md).
