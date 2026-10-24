# set-rule

Read CLAUDE.md and docs/replace-mixpanel.md. Start with the requested project and the current CLI records. Replace the fictional KAURI example with the exact project code. Never guess an actor, evidence, date range or approval.

```bash
npm run analytics -- set-rule --project=KAURI --event="Lesson started" --owner="Reviewer" --purpose="Measure activation" --required='["lesson_id"]' --review-on=2027-01-01 --actor="Operator"
```

Options: --event, --owner, --purpose, --required, --review-on. Add --json for structured results. On an ambiguous reference, list the candidates and obtain an exact code. Present the result with its project and observation period.

Read before writing. Use the operator's requested values and name in --actor. Do not invent approval or evidence. Rerun the relevant read command afterwards to verify the write.
