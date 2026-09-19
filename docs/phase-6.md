# Phase 6 — Demo Automation

## Goal

Make temporary sales demos launchable and accountable without risking core services.

## Deliverables

- Demo templates for School ERP, College ERP, and future products.
- Demo records linked to leads/clients/meetings.
- Permission check, resource guard, template availability check, and launch lifecycle.
- Synthetic data seeding, health check, URL allocation, expiry, stop, and failure handling.
- Demo history, requested-by tracking, expiry policy, and DEMO labeling.

## Acceptance checks

- Demos cannot launch when capacity or prerequisites are insufficient.
- Every running demo has an expiry.
- Expired demos stop while their CRM history remains.
- Demo data never uses real student records.
- A demo cannot consume resources needed by CRM, website, MySQL, or MinIO.
