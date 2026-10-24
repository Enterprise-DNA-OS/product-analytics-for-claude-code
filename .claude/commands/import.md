# import

Read CLAUDE.md and docs/replace-mixpanel.md. Start with the requested project and the current CLI records. Replace the fictional KAURI example with the exact project code. Never guess an actor, evidence, date range or approval.

```bash
npm run analytics -- import --project=KAURI mixpanel --file=imports/events.jsonl --actor="Operator" --dry-run
```

Options: --file, --dry-run. Add --json for structured results. On an ambiguous reference, list the candidates and obtain an exact code. Present the result with its project and observation period.

Dry-run first, reconcile source count and identity assumptions, then repeat without --dry-run only for the authorised import. Raw event export only. An import never changes source data or collects new events. Conflicts abort the whole file.
