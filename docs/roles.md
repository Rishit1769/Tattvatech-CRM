# Organizational roles and project delivery authority

Authorization is capability-based. A person's name is never used as an authorization rule; role assignments and permissions are the source of truth.

## CTO delivery authority

The CTO role has organization-wide project visibility and can manage the technical delivery lifecycle. The lifecycle is separate from the legacy delivery status so existing task and reporting workflows remain compatible.

The controlled lifecycle is `PLANNING` → `DEVELOPMENT` → `TESTING` → `DEPLOYED`.

Every change creates a `ProjectStatusHistory` record with the previous stage, new stage, actor, timestamp, and optional note. Marking a project `DEPLOYED` requires an environment, deployment URL, deployment date, and explicit confirmation in the project UI. It also creates a deployment record; deployments remain separate from the project lifecycle so multiple environments and deployment history can be tracked.

## Deployment permissions

| Permission | Purpose |
| --- | --- |
| `project.view_all` | View organization-wide project records |
| `project.implementation.view` | View technical implementation information |
| `project.lifecycle.manage` | Change the controlled project lifecycle |
| `project.deployment.view` | View deployment records and health metadata |
| `project.deployment.create` | Record a deployment |
| `project.deployment.edit` | Update deployment metadata |
| `project.deployment.mark_active` | Mark a deployment active |

The seed file assigns the full lifecycle/deployment set to CTO. CEO receives organization-wide project and implementation/deployment visibility without lifecycle mutation authority. Other roles remain restricted by the existing project visibility rules until an explicit permission is assigned.
