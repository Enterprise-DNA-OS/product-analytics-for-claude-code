# draft-review

Read CLAUDE.md and docs/replace-mixpanel.md. Start with the requested project and the current CLI records. Replace the fictional KAURI example with the exact project code. Never guess an actor, evidence, date range or approval.

```bash
npm run analytics -- draft-review --project=KAURI
```

Options: none beyond project and output options. Add --json for structured results. On an ambiguous reference, list the candidates and obtain an exact code. Present the result with its project and observation period.

Return the generated local file and a summary in chat. Never send, publish or upload it.
