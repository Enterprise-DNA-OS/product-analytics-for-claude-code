# Replace the product review workflow in Mixpanel

## Get the raw events

Use Mixpanel's [Raw Event Export endpoint](https://docs.mixpanel.com/reference/raw-event-export), operated by someone authorised for the project. It returns one event object per line with an event name and properties. Select the complete date range and record the project, filters and export time. Keep the result as events.jsonl. Decompress a compressed download before import. JSON arrays of the same event objects are also accepted.

The vendor's export documentation says date selection can depend on the project's creation date and timezone. Check that boundary against the source report; this build evaluates calendar dates in UTC. Do not use a dashboard CSV as raw events. The importer does not ask for a key or call Mixpanel.

## One command after project setup

Create the destination project as shown in README.md. Then:

```bash
npm run analytics -- import mixpanel --project=LIVE --file=imports/events.jsonl --actor="Operator" --dry-run
npm run analytics -- import mixpanel --project=LIVE --file=imports/events.jsonl --actor="Operator"
```

Use one file from one source project per command. Repeated or overlapping files skip identical events. The whole import is transactional, including event definitions and its log. A conflicting event rejects the import without partial writes. Numeric Unix seconds are required; future times, missing identities and malformed records fail. Milliseconds and quoted timestamps fail instead of silently changing the date.

| Source | Destination |
|---|---|
| event | Event name, preserved exactly |
| properties.distinct_id | Identity as text, without merging |
| properties.time | UTC timestamp from numeric Unix seconds |
| properties.$insert_id | Part of the project-scoped deduplication key |
| Every source property | Retained in properties and source_record |
| No insert identifier | Stable hash of the full record |

The deduplication tuple is event name, identity, event time and insert identifier. A repeated tuple with changed properties is a conflict. Without an insert identifier, changing any field creates another identity for the event; inspect the source before importing corrected files. There is no silent replacement or deletion command.

## Reconcile before switching

Run events, active-users, daily, quality and freshness with the source date range. Compare total events, each event count and raw distinct identities. Compare an ordered funnel using identical steps, date range and window. Check retention only after agreeing full history, identity mapping, cohort entry and exact-day definitions. Keep a signed review record of the differences.

Profile records, identity-merge graphs, saved dashboards, cohort definitions, annotations, session replay, feature flags, experiments, permissions and collection configuration do not migrate in a raw event file. Record your event rules and define the funnels separately. The included fixture is synthetic; it is not an export from a customer account.

The free importer uses memory for the supplied file and has no streaming ingestion service. Validate representative volumes on the chosen machine and database. Split large exports by their source date range before importing. Keep source copies and a tested database backup. The JSON export command is a project archive, not a complete restore utility.

Keep production collection running until you have agreed and tested its replacement. An offline report is not a replacement for data collection. Enterprise DNA scopes collection, identity resolution, capacity, retention handling and team access for the installed version. Bring the source report to Sam's call so the agreement starts with a concrete comparison.

Primary sources checked 24 October 2026: [raw export](https://docs.mixpanel.com/reference/raw-event-export), [event structure](https://docs.mixpanel.com/docs/data-structure/events-and-properties).
