# Customise the measurement system

Read CLAUDE.md, README.md and the current records. Clarify the requested field, rule or workflow from the operator's words. Back up the working database. Add a forward migration under supabase/migrations without editing applied migrations. Change scripts/analytics.mjs and the relevant recipe and renderer declarations. Test in temporary data, including the old data shape and boundary cases. Run npm test, then apply npm run migrate to the authorised destination and show the result. Do not silently change historical funnel or identity semantics.
