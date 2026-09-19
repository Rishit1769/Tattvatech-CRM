# Phase 4 — Nodemailer Events

## Goal

Create dependable, centralized transactional and internal email delivery.

## Deliverables

- One server-side mail service using Nodemailer.
- Reusable branded templates and recipient resolution.
- Lead assignment/creation, meeting, proposal, finance, AMC, project, and infrastructure event templates.
- Internal versus external recipient rules and visible recipient confirmation.
- `email_events` delivery log with `PENDING`, `SENT`, `FAILED`, and `SKIPPED` states.
- Authorized resend flow that preserves attempt history.

## Acceptance checks

- SMTP secrets never reach the browser.
- A failed email does not roll back a valid transaction/invoice.
- Failed mail can be retried without creating a duplicate business record.
- Client mail uses finance/primary contacts or explicit user selection.
