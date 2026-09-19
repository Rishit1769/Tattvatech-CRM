# Phase 5 — Infrastructure

## Goal

Give the team simple, actionable visibility into the systems that keep the company running.

## Deliverables

- Server registry with ownership/control classification and CORE/NON-CORE labeling.
- Service registry for CRM, website, MySQL, MinIO, and future services.
- Basic CPU/RAM/disk/uptime/heartbeat metrics with retention.
- Health status, thresholds, alerts, and private infrastructure dashboard.
- Incident lifecycle, ownership, severity, impact, cause, and resolution.
- Critical technical email notifications.

## Acceptance checks

- Core services are clearly distinguished from the college server and demos.
- Thresholds are configurable rather than scattered constants.
- An outage can be tracked from failed health check through resolution.
- Metrics retention prevents unbounded database growth.
