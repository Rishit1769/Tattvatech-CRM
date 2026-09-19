# Database Schema

This is the conceptual Version 1 MySQL schema. Exact column types and migration syntax may evolve, but names, ownership, relationships, and lifecycle rules should remain coherent.

## Conventions

- Use `snake_case` table and column names.
- Use opaque/stable internal IDs; expose separate human-readable numbers.
- Use `DECIMAL(15,2)` or an equivalent precise decimal for money.
- Use centralized status enums/constants.
- Use archive/disable/void/cancel states instead of deleting historical records.
- Store JSON only for snapshots/metadata/settings where relational columns are not appropriate.

## Foundation and access

| Table | Core fields | Key constraints |
|---|---|---|
| `users` | `id`, `full_name`, `email`, `password_hash`, `role_id`, `status`, `avatar_file_id`, login/disable timestamps, audit creator | unique email; disabled users cannot log in |
| `roles` | `id`, `name`, `description`, `is_system` | data-driven roles |
| `permissions` | `id`, `permission_key`, `description` | unique permission key |
| `role_permissions` | `role_id`, `permission_id` | composite unique pair |
| `sessions` | `id`, `user_id`, `session_token_hash`, created/expiry/revoked timestamps | validate server-side |

## CRM and relationship records

| Table | Purpose |
|---|---|
| `leads` | Potential opportunity, stage, owner, source, value, next follow-up, and outcome |
| `lead_stage_history` | Immutable stage transitions with actor, timestamps, and note |
| `clients` | Organization/account created directly or from a won lead |
| `contacts` | Multiple people per client, including primary, finance, and technical flags |
| `meetings` | Scheduled/completed interactions linked to lead, client, or project |
| `meeting_internal_attendees` | Meeting-to-user join table |
| `meeting_external_attendees` | Meeting-to-contact/external attendee records |
| `follow_ups` | Assigned actions with due date, status, and completion note |
| `proposals` | Proposal/quotation metadata, versions, amount, status, and linked file |
| `notes` | Simple notes attached to supported entities |
| `activities` | User-friendly timeline events with actor, entity, summary, and metadata |
| `notifications` | In-app user notifications and target links |

Important lead stages: `NEW`, `CONTACTED`, `MEETING_SCHEDULED`, `MEETING_DONE`, `PROPOSAL_REQUIRED`, `PROPOSAL_SENT`, `NEGOTIATION`, `WON`, `LOST`.

## Delivery records

| Table | Purpose |
|---|---|
| `projects` | Client delivery record, owners, dates, value, payment structure, and deployment notes |
| `tasks` | Work items belonging to a project |
| `milestones` | Delivery/payment points with due/completion state |

Projects require a client. Tasks require a project. A won lead may preserve its history while creating/reusing a client and optionally creating a project.

## Finance and documents

| Table | Purpose |
|---|---|
| `transactions` | Manual Version 1 payments, expenses, refunds, transfers, and other entries |
| `invoices` | Invoice identity, transaction/client/project links, totals, billing snapshot, and file link |
| `invoice_items` | Invoice line items, quantity, price, tax, and totals |
| `amc_contracts` | Recurring support/maintenance obligation and next due date |
| `amc_payments` | AMC period payment linked to a transaction |
| `files` | MinIO bucket/key, filename, MIME, size, category, entity, uploader, archive state |
| `email_events` | Delivery attempts, recipient, status, timestamps, and failure details |
| `settings` | Configurable business values as JSON, never secrets |

Transaction types include `PAYMENT_RECEIVED`, `EXPENSE`, `REFUND`, `TRANSFER`, `OTHER_INCOME`, and `OTHER`. Transaction statuses include `RECORDED`, `VERIFIED`, and `VOID`.

Invoice numbers and transaction numbers are separate from internal IDs and must be allocated safely under concurrency.

## Infrastructure

| Table | Purpose |
|---|---|
| `servers` | Server identity, environment, hostname, ownership/control, and status |
| `services` | Service registry, server link, health endpoint, status, and core badge |
| `server_metrics` | Timestamped CPU, memory, disk, network, load, and uptime samples |
| `incidents` | Severity, affected server/service, ownership, impact, cause, resolution, and timestamps |
| `demo_environments` | Template, linked meeting/lead/client, server, URL, lifecycle, expiry, and failure state |

## Relationship rules

- `project.client_id` is required.
- `task.project_id` is required.
- `invoice.client_id` is required.
- `PAYMENT_RECEIVED` transactions require a client.
- AMC payments require an AMC and transaction.
- File targets must reference an existing authorized entity.
- User deletion must not remove historical activity, audit, finance, or ownership history.
- Client/project/invoice/file history is retained when a record is archived.

## Indexes and retention

Index foreign keys, stage/status fields, owners/assignees, dates, invoice numbers, transaction references, and common search fields. Paginate growing tables. Apply retention/downsampling to `server_metrics`; do not allow monitoring history to grow without bound.

## Invoice historical snapshots

Invoices store seller and buyer billing snapshots at generation time. Later changes to client addresses or company settings must not rewrite historical invoices. Issued invoice files are treated as immutable; corrections use void plus a new invoice.

## Migrations and seed data

All schema changes are version-controlled migrations. Development seed data may include four sample users, roles, permissions, and representative CRM/project/finance records. Never seed fake production finance data into a live database, and keep demo data isolated from live CRM data.
