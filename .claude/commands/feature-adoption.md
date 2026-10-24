# feature-adoption

Read CLAUDE.md and docs/replace-mixpanel.md. Start with the requested project and the current CLI records. Replace the fictional KAURI example with the exact project code. Never guess an actor, evidence, date range or approval.

```bash
npm run analytics -- feature-adoption --project=KAURI
```

Options: --from, --to. Add --json for structured results. On an ambiguous reference, list the candidates and obtain an exact code. Present the result with its project and observation period.

Read the measurement definitions in README.md. Verify completeness, UTC boundary, identity handling and denominator before describing the result. The tool answers an imported snapshot, not a live product feed.
