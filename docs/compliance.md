# Record checks, measurement integrity and privacy

Checked 24 October 2026. These are review prompts tied to recorded evidence. They do not certify legal compliance, determine a lawful basis, or replace the responsible person's assessment. No fixed statutory retention period is invented for analytics.

| Rule | Implemented check | Source and limit |
|---|---|---|
| tracking_contract | Event owner and purpose must be recorded; absent fields appear in attention and compliance. | [NZ Privacy Principle 1](https://www.privacy.org.nz/privacy-principles/1/): collection must have a lawful, necessary purpose. A nonempty description does not prove necessity. |
| tracking_accuracy | Agreed required property names must be present and not null or empty. Invalid source timestamps and missing identities fail import. | [NZ Privacy Principle 8](https://www.privacy.org.nz/privacy-principles/8/): take reasonable accuracy, relevance and completeness steps before use or disclosure. The software cannot verify the truth of an event. |
| privacy_retention | A project review date before today is flagged. review-project records the responsible review and revised date. | [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/): retain personal information only as long as needed for lawful use. The date is an internal reminder, not an authorised deletion date. |
| event_review | Missing or expired event review dates are flagged. set-rule logs prior and new definitions. | Internal control supporting purpose and accuracy review. No statutory review interval is asserted. |
| overdue_action | Open actions past due appear in attention; closure requires evidence and actor. | Internal operating rule, not legislation. |

For organisations subject to Australia's APPs, [APP 11 guidance](https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-11-app-11-security-of-personal-information) covers protection and, subject to exceptions, destruction or de-identification when information is no longer needed. A qualified responsible person decides applicability and retention, including holds, before any disposal. This build never deletes records automatically.

Identifiers and raw properties can be personal information. Pseudonyms are not automatically anonymous. Minimise collection and imports, restrict the machine and database, and review the whole document before sharing. [NZ Principle 11](https://www.privacy.org.nz/privacy-principles/11/) concerns permitted disclosures; this build does not decide whether a recipient is authorised.

Database tables enable row-level security and revoke public access. They are designed for a dedicated trusted operator connection, not browser or anonymous access. No tenant or end-user authorisation service ships here. Generated dashboards and documents cover every project available to that operator. Files use restrictive permissions where supported by the operating system. Database encryption, backups, access review, incident handling and deletion procedures are deployment responsibilities. The activity record can be edited by the database owner and is not tamper-proof.

Funnel, retention, adoption and flow definitions are in README.md. Imports preserve evidence and reject conflicts. The export's completeness, identity mapping and timezone require a separate reconciliation. Do not make a decision about an individual from an unverified absence of events.
