# Operations and Reliability

## Deployment checklist

- Build and TypeScript checks pass.
- Migration is reviewed and version-controlled.
- Environment variables are present.
- Recent backup exists and rollback is understood.
- MySQL, MinIO, and SMTP are reachable.
- Health endpoint is available.

## Backup policy

Back up MySQL, MinIO objects, and recovery configuration regularly. Keep at least one copy off the ROG. Show backup age and alert on failure. Test restores periodically; a backup that has never been restored is unverified.

MySQL and MinIO backups should be close enough in time to avoid database file references pointing to missing objects.

## Core service health

The private infrastructure view should show CRM, website, MySQL, and MinIO as core services, plus future n8n/WhatsApp services when configured. Health endpoints must not expose secrets. Services should recover after host reboot; demos follow explicit expiry policy and should not resurrect unexpectedly.

Suggested thresholds:

| Condition | Severity |
|---|---|
| CPU above 85% sustained | Warning |
| RAM above 90% | Critical |
| Disk above 80% / 90% | Warning / Critical |
| Core HTTP, MySQL, or MinIO failure | Critical |
| Demo launch failure | Warning or Critical based on meeting context |

## Incident runbooks

### CRM down

Confirm server, application process, MySQL, disk, and recent deploy. Restore service, verify login/dashboard, then record cause and resolution.

### MySQL down

Check service, disk, memory, and data directory. Restore, verify application connectivity and recent transactions, then update the incident.

### MinIO down

Check process, HDD mount, disk space, credentials, and a known object. After recovery test both download and new upload.

### Email failing

Check SMTP configuration/provider and event failure details. Do not create another payment or invoice. Restore connectivity and retry the failed event.

### Demo will not start

Check server capacity, template/image availability, resource conflicts, and the stored failure message. Retry safely or use a known fallback demo if a meeting is imminent.

## Data and privacy

Store only work-relevant contact information. Do not place real student records in demo environments. Client production data does not automatically belong in the CRM. Do not store client server secrets in ordinary CRM fields.

## Recovery priorities

1. CRM
2. Company website
3. MySQL
4. MinIO
5. Future firm-wide automation
6. Temporary demos

A demo must never consume enough resources to take down a core service.
