# Engineering Conventions and Quality

## Naming and dates

- Database: `snake_case`.
- TypeScript: PascalCase for components/types, camelCase for variables/functions.
- Human numbers: examples `TT-TXN-2026-000001`, `TT-INV-2026-0001`, `TT-PROJ-2026-0012`.
- Store timestamps, not formatted display strings.
- Centralize date and timezone formatting; current business display commonly uses India time.
- Centralize statuses so equivalent values cannot drift between pages.

## UX baseline

Every list supports appropriate search/filter/sort/pagination and has loading, empty, and error states. Every form has labels, required states, inline validation, disabled submit state, success feedback, and no double-submit. Status must not be communicated by color alone.

Detail pages should use a consistent record header, breadcrumbs, tabs, related links, and timeline. Important entities are Lead, Client, Project, Invoice, Transaction, AMC, Meeting, and Server.

## Validation and authorization

Validate on the server even when the UI validates. Examples: positive transaction amount, valid stage, existing owner/client/project, unique invoice number, mathematically consistent totals, allowed MIME type/size, and authorized file target.

Record ownership is not global permission. A user may own a lead without seeing company-wide finance.

## Activity versus audit

Activity is human-readable history, for example “Rishit recorded a payment.” Audit is technical/security history with actor, action, entity, request ID, and before/after values where appropriate. Sensitive actions may create both.

## Idempotency and destructive actions

Guard payment recording, invoice generation, mail sending, and demo launch against duplicate clicks/retries. Use unique relationships and server-side idempotency keys where needed.

Require confirmation for voiding transactions/invoices, archiving clients, deleting/archiving files, stopping demos, and disabling users. Prefer void/archive over hard delete.

## Definition of done

Before a feature is complete, verify:

- server-side permission check;
- validation and database-failure handling;
- loading, empty, and actionable error states;
- duplicate-submission protection;
- activity and audit where relevant;
- mail/file authorization where relevant;
- pagination for growing lists;
- correct timestamps and no exposed secrets;
- laptop-sized usability and accessible labels/focus states;
- destructive confirmation where needed.

## Version 1 boundary

Required: authentication/RBAC/settings/audit, CRM, projects, manual finance/invoices/AMC, documents/search/My Work/notifications, and basic infrastructure/demo visibility.

Not required: bank sync, reconciliation, full accounting ledger, payroll, HR, Slack clone, advanced AI, analytics warehouse, multi-company tenancy, public client portal, or native mobile app.
