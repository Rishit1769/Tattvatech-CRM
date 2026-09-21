# TattvaTech organizational roles and authorization

This document describes the organizational foundation implemented by the CRM. It is deliberately separate from the project module: an organizational role, a department, a reporting manager, a project membership, and a project role answer different questions.

## The model

```text
User
├── Roles[]                 company responsibilities (many-to-many)
├── Primary department      organizational home
├── Reports to              manager relationship
├── Effective permissions   union of all active role permissions
└── Project memberships[]
       └── Project role      responsibility on one project
```

The legacy `User.roleId` remains as a compatibility/default role for existing accounts. New authorization resolves both that role and every active `UserRole` assignment. It never treats a comma-separated role string or a person's name as authorization data.

## Organizational roles

The initial roles are `CEO`, `CTO`, `CFO`, `CMO`, `HR`, `MANAGER`, `EMPLOYEE`, and `INTERN`. Roles are persisted in `roles`; assignments are persisted in `user_roles` with a uniqueness constraint on `(user_id, role_id)`. A user can hold several roles at once. Permissions are the union of permissions granted by all active roles; a restrictive-sounding role is not an implicit deny.

| Role | Primary responsibility | Typical visibility |
| --- | --- | --- |
| CEO | Company-wide oversight | All project and company overview information; destructive actions still need explicit permissions |
| CTO | Technology ownership | Technology department projects, technical team, infrastructure, delivery work |
| CFO | Finance ownership | Transactions, invoices, payments, expenses, AMC, and project financial context |
| CMO | Marketing and sales | Leads, pipeline, meetings, proposals, clients, and acquisition work |
| HR | People administration | Users, roles, departments, reporting relationships, and assignment visibility; not secrets or finance by default |
| MANAGER | Department-scoped management | Department projects, team workload, task assignment, meetings, and project updates |
| EMPLOYEE | Assigned operational work | Assigned projects, tasks, meetings, and permitted project activity |
| INTERN | Restricted assigned work | Explicitly assigned projects/tasks/meetings only |

HR is horizontal people administration, not a grant of every department's operational permissions. CTO, CFO, and CMO ownership is likewise represented by permissions rather than hard-coded route exceptions.

## Departments and reporting

Departments are data-driven records: `EXECUTIVE`, `TECHNOLOGY`, `FINANCE`, `MARKETING_SALES`, `HUMAN_RESOURCES`, and `OPERATIONS`. A user has one primary department today, independently of their roles. `reportsToId` creates the reporting hierarchy and supports direct reports without encoding a person's name in code.

```text
CEO
├── CTO
│   └── Technology Manager
│       ├── Employee
│       └── Intern
├── CFO
├── CMO
└── HR
```

## Initial assignment matrix

| User | CEO | CTO | CFO | CMO | HR | MANAGER | EMPLOYEE | INTERN |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| loukik.salvi@tattvatech.co.in | ✓ | — | ✓ | ✓ | ✓ | ✓ | — | — |
| abhijeet.jadhav@tattvatech.co.in | — | — | ✓ | ✓ | ✓ | ✓ | — | — |
| rishit.singh@tattvatech.co.in | — | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| raunak.singh@tattvatech.co.in | — | ✓ | ✓ | ✓ | ✓ | ✓ | — | — |

The seed locates these accounts by normalized exact email, reports missing accounts, is idempotent, and does not create substitute users.

## Project access

Project access combines role permissions with scope. `project.view_all` is company-wide, `project.view_department` is limited to the user's department, and `project.view_assigned` is limited to active project membership or ownership/management fields. Server routes apply the scope; hiding a navigation item is never considered authorization.

```text
Technology Intern + member of 2.1 School ERP → can view 2.1
Technology Intern + no membership of 2.2 College ERP → cannot view 2.2
CTO + Technology department → can view Technology projects
CEO → can view all projects
```

## Permission layers

Examples include `project.create`, `project.edit`, `project.manage_members`, `project.assign_tasks`, `project.manage_modules`, `project.view_activity`, `finance.view`, and `infrastructure.manage`. Visibility and mutation are separate permissions. A role may grant read access without granting destructive operations.

## Project roles are different

```text
Organizational role: INTERN
Department: TECHNOLOGY
Project: 2.1 School ERP
Project role: BACKEND_DEVELOPER
```

Project roles live on `project_members` and can be `OWNER`, `MANAGER`, `TECH_LEAD`, `DEVELOPER`, `BACKEND_DEVELOPER`, `FRONTEND_DEVELOPER`, `FULLSTACK_DEVELOPER`, `DESIGNER`, `TESTER`, `DEVELOPER_INTERN`, `MARKETING`, `FINANCE`, or `OTHER`. A mentor relationship is also project-specific.

## Security and growth

Every project read and mutation must resolve the current session, permissions, and project scope on the server. Direct URLs are checked just like navigation requests. Future role administration can expose role badges and department/reporting fields without changing the authorization model. Explicit deny policies, if needed later, should be implemented as a separate policy layer; they must not be inferred from the presence of `INTERN` or the absence of `CEO`.
