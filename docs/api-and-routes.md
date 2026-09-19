# API, Routes, and Server Boundaries

## Route handler conventions

Use resource-oriented route handlers where appropriate. Server actions are also allowed, but the same domain service must back both approaches. Do not duplicate business rules in pages, route handlers, and form components.

## Logical API surface

```text
POST   /api/auth/login
POST   /api/auth/logout

GET/POST   /api/leads
GET/PATCH  /api/leads/:id
POST       /api/leads/:id/stage
POST       /api/leads/:id/convert

GET/POST   /api/clients
GET/PATCH  /api/clients/:id
GET/POST   /api/meetings
PATCH      /api/meetings/:id
POST       /api/meetings/:id/complete
GET/POST   /api/projects
GET        /api/projects/:id
POST       /api/tasks
PATCH      /api/tasks/:id

GET/POST   /api/finance/transactions
POST       /api/finance/transactions/:id/void
GET        /api/finance/invoices
GET        /api/finance/invoices/:id
POST       /api/finance/invoices/:id/send

POST       /api/files
GET        /api/files/:id
DELETE     /api/files/:id
POST       /api/demo-environments
POST       /api/demo-environments/:id/stop
GET        /api/search
```

Exact endpoint expansion is expected as implementation proceeds; permission and validation behavior is part of the contract.

## Request lifecycle

1. Parse/authenticate the request.
2. Load the user and verify the required capability.
3. Validate input with bounded, explicit rules.
4. Execute the domain service and database transaction where applicable.
5. Record activity and audit entries according to the event.
6. Perform external side effects with explicit status tracking.
7. Return a stable success/error shape suitable for the UI.

## Compound workflow boundaries

The database portion of payment recording may atomically create the transaction, invoice metadata, and activity intent. MinIO upload and email are external side effects: persist their statuses, show partial failure clearly, and allow safe retry.

Examples:

- If MySQL commit fails, do not send a success email or claim an invoice exists.
- If MinIO fails, keep the transaction if it is valid but mark invoice storage incomplete and provide retry.
- If email fails, keep the valid transaction/invoice and create a failed mail event for resend.
- Repeated invoice generation/payment submissions must use idempotency/unique guards.

## App Router pages

```text
app/
  (auth)/login
  (workspace)/dashboard
  (workspace)/leads/[id]
  (workspace)/clients/[id]
  (workspace)/meetings/[id]
  (workspace)/projects/[id]
  (workspace)/finance/transactions/[id]
  (workspace)/finance/invoices/[id]
  (workspace)/infrastructure/servers/[id]
  (workspace)/workspace/my-work
  (workspace)/workspace/documents
  (workspace)/workspace/search
  (workspace)/company/team
  (workspace)/company/roles
  (workspace)/company/audit
  (workspace)/company/settings
```

The complete navigation also includes lists for leads, pipeline, clients, meetings, follow-ups, proposals, projects, tasks, milestones, finance views, servers, services, demos, incidents, alerts, calendar, notes, and activity.

## Permission model

Permission keys are predictable, such as `lead.view`, `lead.create`, `lead.assign`, `finance.transaction.create`, `finance.transaction.void`, `finance.invoice.send`, `document.upload`, `infrastructure.demo.launch`, and `audit.view`. Check permissions both in navigation/UI and on the server. Test direct URL and direct API access for every role.
