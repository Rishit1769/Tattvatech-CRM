# Application Architecture

## 1. System shape

The CRM is a single Next.js application containing the UI, server components, route handlers/server actions, authentication, permissions, business services, invoice generation, and email orchestration.

```text
Browser
  ↓
Next.js application
  ├─ React UI / Server Components
  ├─ Auth and RBAC
  ├─ Domain services
  ├─ Route handlers / server actions
  ├─ Invoice generation
  └─ Nodemailer mail service
       ├─ MySQL: structured records
       └─ MinIO: private binary documents
```

Do not split ordinary CRM modules into separate services or repositories.

## 2. Responsibilities by layer

### UI layer

Displays role-aware navigation, lists, forms, detail pages, timelines, dashboards, loading states, empty states, and actionable errors. UI permission checks improve usability but are never the security boundary.

### Server/application layer

Owns authentication, authorization, validation, transactions, workflow orchestration, activity/audit creation, file authorization, invoice numbering, email delivery status, and idempotency.

### MySQL

Stores users, permissions, CRM records, project/finance records, metadata, settings, activities, audits, notifications, and infrastructure state. Store money as precise decimals and timestamps as real temporal values.

### MinIO

Stores private objects: invoices, proposals, quotations, contracts, attachments, receipts, client/project files, exports, and internal documents. MySQL stores the object metadata and stable key.

### Nodemailer

Provides one server-side mail service for templates, recipient resolution, delivery, failure logging, and resend. SMTP credentials never reach the browser.

## 3. Hosting and environments

### Development

Developer machines use a local Next.js app, local MySQL, local MinIO or a development bucket, development SMTP, and isolated sample data. Development must never point at production by default.

### TattvaTech-controlled core server

The ASUS ROG is the primary home for the company website, CRM, MySQL, MinIO, and future n8n/WhatsApp services. Core services must restart after reboot and expose health visibility.

Suggested storage placement:

- SSD: OS, application code, MySQL, runtime-critical data.
- HDD: MinIO objects and other non-latency-sensitive document data.

The HDD is not a backup strategy by itself.

### College-hosted server

The approximately 32 GB college server is externally controlled and must not be a dependency for the CRM, website, or operational continuity. It may only support authorized, non-critical experimentation.

### Client production

Sold SaaS/ERP products are deployed to client-provided or client-controlled infrastructure. The CRM may record deployment/support/AMC information but must not casually store client server secrets.

### Demo environments

Temporary demos run on TattvaTech infrastructure, are explicitly labelled `DEMO`, have an expiry, use synthetic data, and are resource-guarded so they cannot starve core services.

## 4. Security boundaries

- Validate every write on the server.
- Enforce permissions on every sensitive server operation.
- Keep MySQL and MinIO admin interfaces private.
- Keep MinIO buckets private; downloads go through authenticated, authorized application flows.
- Use secure password hashing and secure sessions.
- Keep secrets in server environment configuration.
- Never log passwords, session tokens, SMTP credentials, MinIO secrets, or sensitive documents.

## 5. Suggested source organization

```text
src/
  app/                         # App Router pages and route handlers
  components/                  # reusable UI and domain components
  lib/                         # auth, db, MinIO, mail, validation, permissions
  server/                      # domain services by module
  types/
  utils/
  constants/
```

Do not put all business logic in `page.tsx`, and do not duplicate invoice, mail, activity, or permission logic across modules.
