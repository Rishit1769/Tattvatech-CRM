# Module Guide

Each module owns its domain workflows and exposes data through shared server-side services. Modules should create activity records for meaningful state changes and audit sensitive operations.

## Foundation

### Authentication and team

Provides login, secure password hashing, sessions, user lifecycle (`ACTIVE`, `INVITED`, `DISABLED`), roles, and capability-based permissions. Initial roles are Owner, Admin, Business, Technical, and Member. A person’s name must never be used as an authorization rule.

### Settings

Owns company identity, invoice numbering/branding, default currency, expense categories, payment methods, AMC reminders, notification defaults, and email sender configuration. Secrets remain environment configuration. Settings changes are audited.

### Activity, audit, notifications

Activity is readable business history; audit is technical/security history. Notifications are user-specific in-app alerts. Important events include stage changes, meetings, proposals, conversions, payments, invoices, files, demos, and incidents.

## Sales and CRM

### Leads and pipeline

Tracks opportunities from `NEW` through `WON`/`LOST`, with owner, source, interest, expected value, next action, and stage history. Pipeline is a visual view over the same lead records; drag-and-drop is a real server-validated stage change. Mark lost requires a reason. Mark won preserves history and supports client/project creation.

### Clients and contacts

Clients are organizations/accounts; contacts are separate people records with primary, finance, and technical flags. Client detail aggregates meetings, projects, finance, AMC, documents, infrastructure, and activity.

### Meetings and follow-ups

Meetings support internal/external attendees, agendas, outcomes, requirements, decisions, next action, owner, and deadline. Completing a meeting may create follow-ups, tasks, proposal requirements, project actions, or demo requirements. Follow-ups surface overdue, today, and upcoming work.

### Proposals and quotations

Stores metadata and version history in MySQL and files in MinIO. Statuses: `DRAFT`, `READY`, `SENT`, `ACCEPTED`, `REJECTED`, `EXPIRED`. Sending routes through the mail service, logs delivery, changes status, and adds activity.

## Delivery

### Projects

Created from won business or directly for an existing client. Tracks project code, scope, owners, status, priority, dates, value, payment structure, repository/deployment notes, milestones, tasks, files, finance, and activity. Project status includes `PLANNING`, `ACTIVE`, `BLOCKED`, `WAITING_CLIENT`, `ON_HOLD`, `COMPLETED`, `CANCELLED`.

### Tasks and milestones

Tasks are assigned project work with statuses from `BACKLOG` to `DONE`/`CANCELLED`, priorities from `LOW` to `URGENT`, and due dates. Milestones represent meaningful delivery/payment points and can require invoices.

## Finance

### Transactions and expenses

Version 1 is manual-first. Authorized users record payments, expenses, refunds, transfers, and other entries. Financial records are never casually deleted; voiding requires actor, timestamp, and reason. Duplicate indicators include matching client, date, amount, and reference.

### Invoices and documents

For a qualifying payment: validate and save the transaction, allocate a unique invoice number, create invoice metadata and line items, generate a PDF from server-side snapshots, upload it to private MinIO, store the file link, create activity, and send/log email. Transaction and invoice persistence must be distinguished from MinIO/email side effects so failures can be retried without duplicate business records.

### AMC

Tracks recurring support contracts, billing frequency, amount, next due date, responsibility, payments, reminders, and status. An AMC payment links to a transaction, records the covered period, updates the next due date, and can generate an acknowledgement/invoice.

### Finance dashboard and receivables

Provides manually derived receipts, expenses, net recorded cash flow, outstanding items, AMC status, and useful reports. It is an operational finance tracker, not a statutory accounting replacement.

## Workspace

### Documents

Searchable MinIO-backed metadata view across invoices, proposals, quotations, contracts, attachments, receipts, client/project files, and internal documents. Archive rather than casually delete; all downloads and deletion/archive actions are authorized and audited.

### My Work and search

My Work consolidates meetings, follow-ups, tasks, owned leads, owned projects, and pending actions. Universal search covers leads, clients, contacts, projects, invoice numbers, transaction references, meetings, and document metadata while filtering unauthorized results.

## Infrastructure

### Servers and services

Registry for TattvaTech-controlled, client-controlled, and externally controlled systems. Core services include CRM, website, MySQL, and MinIO. Statuses: `HEALTHY`, `DEGRADED`, `DOWN`, `UNKNOWN`, `STOPPED`.

### Metrics, alerts, and incidents

Shows CPU/RAM/disk/uptime/health, threshold-based alerts, and incident lifecycle (`OPEN`, `INVESTIGATING`, `MONITORING`, `RESOLVED`). Critical alerts notify technical users through Nodemailer. Retain enough timestamps to understand recovery and future SLA reporting.

### Demo environments

Launches temporary School ERP/College ERP-style environments for meetings. Flow: permission check → resource guard → create record → start → seed synthetic data → health check → URL/expiry. Demos are never client production, always expire, and preserve their history after stopping.

## Cross-module workflow ownership

```text
Sales: lead → meeting → proposal → won
Delivery: won → client → project → task/milestone
Finance: payment → transaction → invoice → MinIO file → email
Relationship: client → AMC → reminder → payment → next due date
Operations: server/service → health → alert → incident → resolution
```
