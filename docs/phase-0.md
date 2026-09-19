# Phase 0 — Foundation

## Goal

Create the secure application skeleton and shared platform services on which every later module depends.

## Deliverables

- Next.js + TypeScript project and Tailwind setup.
- Local/dev environment configuration for MySQL, MinIO, and SMTP.
- Version-controlled migration baseline and isolated seed data.
- Base App Router layout, sidebar, header, breadcrumbs, and role-aware navigation.
- Secure login, password hashing, sessions, logout, and disabled-account behavior.
- Data-driven roles and permissions with server-side enforcement.
- Shared database, MinIO, validation, activity, audit, and error-handling services.
- Settings foundation and core health endpoint.

## Acceptance checks

- Invalid/disabled users cannot create sessions.
- Direct API and URL access respects permissions.
- No credentials reach client code or logs.
- MySQL and MinIO connectivity works locally.
- Activity and audit records can be created from a test operation.
