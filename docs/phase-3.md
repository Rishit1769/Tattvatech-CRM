# Phase 3 — Finance V1

## Goal

Track manual operational finance and produce reliable, retrievable invoices.

## Deliverables

- Finance settings for currency, methods, categories, and invoice identity.
- Manual transactions and expenses with precise decimals and lifecycle states.
- Duplicate payment warnings and finance permissions.
- Invoice numbering, line items, billing snapshots, and status.
- Server-side invoice PDF generation.
- Private MinIO upload and MySQL file metadata.
- Secure invoice viewing/download.
- Finance dashboard, receivables, reports, and AMC contracts/payments.

## Payment workflow

Save the valid transaction and invoice metadata in MySQL, generate the PDF, upload to MinIO, persist the file reference, create activity, and expose explicit storage/email statuses. Retries must not create duplicate transactions or invoices.

## Acceptance checks

- Amounts and totals are mathematically correct.
- Invoice numbers are unique under concurrent requests.
- Historical seller/buyer details are snapshotted.
- MinIO failure is visible and retryable; it is never presented as a successful file.
- Finance records are voided, not silently deleted.
