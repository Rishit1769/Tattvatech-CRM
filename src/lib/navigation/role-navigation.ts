export type RoleNavItem = {
  label: string;
  href?: string;
  permission?: string;
  children?: RoleNavItem[];
};

export type RoleNavDefinition = {
  key: string;
  label: string;
  aliases: string[];
  landing: string;
  items: RoleNavItem[];
};

const projectItems: RoleNavItem[] = [
  { label: "All Projects", href: "/roles/cto/projects", permission: "project.view_all" },
  { label: "Planning", href: "/roles/cto/projects?lifecycle=PLANNING", permission: "project.view_all" },
  { label: "Development", href: "/roles/cto/projects?lifecycle=DEVELOPMENT", permission: "project.view_all" },
  { label: "Testing", href: "/roles/cto/projects?lifecycle=TESTING", permission: "project.view_all" },
  { label: "Deployment", href: "/roles/cto/projects?lifecycle=DEPLOYMENT", permission: "project.view_all" },
  { label: "Payment Pending", href: "/roles/cto/projects?payment=PENDING", permission: "project.payment_status.view" },
  { label: "Payment Received", href: "/roles/cto/projects?payment=PAID", permission: "project.payment_status.view" },
];

export const roleNavigation: RoleNavDefinition[] = [
  {
    key: "CEO",
    label: "CEO",
    aliases: ["CEO"],
    landing: "/roles/ceo",
    items: [
      { label: "Executive Overview", href: "/roles/ceo", permission: "dashboard.view" },
      { label: "Business", children: [{ label: "Leads", href: "/leads", permission: "lead.view" }, { label: "Clients", href: "/clients", permission: "client.view" }] },
      { label: "Projects", children: [{ label: "Project Overview", href: "/projects", permission: "project.view_all" }, { label: "Deployed Projects", href: "/projects?lifecycle=DEPLOYMENT", permission: "project.view_all" }] },
      { label: "Finance", children: [{ label: "Financial Overview", href: "/finance", permission: "finance.view" }, { label: "Transactions", href: "/finance/transactions", permission: "finance.transaction.view" }, { label: "Invoices", href: "/finance/invoices", permission: "finance.invoice.view" }] },
      { label: "Operations", children: [{ label: "Meetings", href: "/meetings", permission: "meeting.view" }, { label: "Follow-ups", href: "/follow-ups", permission: "follow_up.view" }] },
    ],
  },
  {
    key: "CTO",
    label: "CTO",
    aliases: ["CTO"],
    landing: "/roles/cto",
    items: [
      { label: "Technical Overview", href: "/roles/cto", permission: "dashboard.view" },
      { label: "Projects", children: projectItems },
      { label: "Deployments", children: [{ label: "Active Deployments", href: "/projects?lifecycle=DEPLOYED", permission: "project.deployment.view" }, { label: "Deployment History", href: "/projects", permission: "project.deployment.view" }] },
      { label: "Infrastructure", children: [{ label: "Infrastructure Overview", href: "/infrastructure", permission: "infrastructure.view" }, { label: "Servers", href: "/infrastructure", permission: "infrastructure.view" }, { label: "Services", href: "/infrastructure", permission: "infrastructure.view" }, { label: "Server Health", href: "/infrastructure", permission: "infrastructure.view" }, { label: "Incidents", href: "/infrastructure", permission: "infrastructure.view" }] },
      { label: "Demo Environments", href: "/infrastructure/demos", permission: "infrastructure.view" },
    ],
  },
  {
    key: "FINANCE",
    label: "Finance",
    aliases: ["FINANCE", "CFO"],
    landing: "/roles/finance",
    items: [
      { label: "Finance Overview", href: "/roles/finance", permission: "finance.view" },
      { label: "Projects", children: [{ label: "All Projects", href: "/projects", permission: "project.view_all" }, { label: "Create Project", href: "/finance/projects/create", permission: "finance.project.create" }] },
      { label: "Transactions", href: "/finance/transactions", permission: "finance.transaction.view" },
      { label: "Invoice Generation", href: "/finance/invoices", permission: "finance.invoice.create" },
      { label: "Final Quotations", href: "/finance/quotations", permission: "finance.quotation.view" },
      { label: "Invoices", href: "/finance/invoices", permission: "finance.invoice.view" },
      { label: "Payments", href: "/finance/transactions", permission: "finance.transaction.view" },
      { label: "Expenses", href: "/finance/transactions", permission: "finance.transaction.view" },
      { label: "Receivables", href: "/finance", permission: "finance.view" },
      { label: "AMC / Recurring Revenue", href: "/finance", permission: "finance.view" },
      { label: "Reports", href: "/finance", permission: "finance.view" },
    ],
  },
  {
    key: "SALES",
    label: "Sales",
    aliases: ["SALES", "CMO"],
    landing: "/roles/sales",
    items: [
      { label: "Sales Overview", href: "/roles/sales", permission: "dashboard.view" },
      { label: "Leads", href: "/leads", permission: "lead.view" },
      { label: "Pipeline", href: "/leads", permission: "lead.view" },
      { label: "Clients", href: "/clients", permission: "client.view" },
      { label: "Meetings", href: "/meetings", permission: "meeting.view" },
      { label: "Follow-ups", href: "/follow-ups", permission: "follow_up.view" },
      { label: "Proposals", href: "/leads", permission: "proposal.view" },
      { label: "Quotations", href: "/finance/quotations", permission: "finance.quotation.view" },
    ],
  },
  {
    key: "HR",
    label: "HR",
    aliases: ["HR"],
    landing: "/roles/hr",
    items: [{ label: "HR Overview", href: "/roles/hr", permission: "dashboard.view" }, { label: "Employees", href: "/roles/hr", permission: "team.view" }, { label: "Interns", href: "/roles/hr", permission: "team.view" }, { label: "Team Directory", href: "/roles/hr", permission: "team.view" }, { label: "Roles & Permissions", href: "/roles/hr", permission: "team.manage" }],
  },
  {
    key: "EMPLOYEE",
    label: "Employee",
    aliases: ["EMPLOYEE"],
    landing: "/roles/employee",
    items: [{ label: "My Work", href: "/roles/employee", permission: "dashboard.view" }, { label: "My Projects", href: "/roles/employee/my-projects", permission: "project.view_assigned" }, { label: "My Tasks", href: "/roles/employee", permission: "task.view" }, { label: "Meetings", href: "/meetings", permission: "meeting.view" }, { label: "Documents", href: "/roles/employee", permission: "project.implementation.view" }],
  },
  {
    key: "INTERN",
    label: "Intern",
    aliases: ["INTERN"],
    landing: "/roles/intern",
    items: [{ label: "My Work", href: "/roles/intern", permission: "dashboard.view" }, { label: "My Tasks", href: "/roles/intern", permission: "task.view" }, { label: "My Projects", href: "/roles/intern/my-projects", permission: "project.view_assigned" }, { label: "Documents", href: "/roles/intern", permission: "project.implementation.view" }],
  },
];

export function rolesForUser(roles: string[]) {
  return roleNavigation.filter((definition) => definition.aliases.some((alias) => roles.includes(alias)));
}
