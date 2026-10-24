# review-project

Read CLAUDE.md and docs/replace-mixpanel.md. Start with the requested project and the current CLI records. Replace the fictional KAURI example with the exact project code. Never guess an actor, evidence, date range or approval.

```bash
npm run analytics -- review-project --project=KAURI --owner="Reviewer" --purpose="Reviewed product measurement purpose" --review-on=2027-01-01 --actor="Operator"
```

Options: --owner, --purpose, --review-on. Add --json for structured results. On an ambiguous reference, list the candidates and obtain an exact code. Present the result with its project and observation period.

Read before writing. Use the operator's requested values and name in --actor. Do not invent approval or evidence. Rerun the relevant read command afterwards to verify the write.
