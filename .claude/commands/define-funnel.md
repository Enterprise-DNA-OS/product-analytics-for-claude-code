# define-funnel

Read CLAUDE.md and docs/replace-mixpanel.md. Start with the requested project and the current CLI records. Replace the fictional KAURI example with the exact project code. Never guess an actor, evidence, date range or approval.

```bash
npm run analytics -- define-funnel --project=KAURI --code=NEW --name="Activation review" --steps='["Signed up","Lesson started","Lesson completed"]' --hours=48 --actor="Operator"
```

Options: --code, --name, --steps, --hours. Add --json for structured results. On an ambiguous reference, list the candidates and obtain an exact code. Present the result with its project and observation period.

Read before writing. Use the operator's requested values and name in --actor. Do not invent approval or evidence. Rerun the relevant read command afterwards to verify the write.
