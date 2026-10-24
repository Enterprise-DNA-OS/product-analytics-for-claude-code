# add-action

Read CLAUDE.md and docs/replace-mixpanel.md. Start with the requested project and the current CLI records. Replace the fictional KAURI example with the exact project code. Never guess an actor, evidence, date range or approval.

```bash
npm run analytics -- add-action --project=KAURI --code=TRACK-02 --title="Investigate missing lesson identifier" --owner="Reviewer" --due-on=2027-01-01 --actor="Operator"
```

Options: --code, --title, --owner, --due-on. Add --json for structured results. On an ambiguous reference, list the candidates and obtain an exact code. Present the result with its project and observation period.

Read before writing. Use the operator's requested values and name in --actor. Do not invent approval or evidence. Rerun the relevant read command afterwards to verify the write.
