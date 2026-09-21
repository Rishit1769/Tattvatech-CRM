import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const permissionData = [
  ["dashboard.view", "View the workspace dashboard"],
  ["team.view", "View team members"],
  ["team.manage", "Manage users and roles"],
  ["settings.view", "View company settings"],
  ["settings.manage", "Manage company settings"],
  ["activity.view", "View activity timelines"],
  ["audit.view", "View audit history"],
  ["lead.view", "View leads"], ["lead.create", "Create leads"], ["lead.edit", "Edit leads"], ["lead.assign", "Assign leads"], ["lead.convert", "Convert leads"],
  ["client.view", "View clients"], ["client.create", "Create clients"], ["client.edit", "Edit clients"],
  ["meeting.view", "View meetings"], ["meeting.create", "Create meetings"], ["meeting.edit", "Edit meetings"], ["meeting.complete", "Complete meetings"],
  ["follow_up.view", "View follow-ups"], ["follow_up.create", "Create follow-ups"], ["follow_up.edit", "Edit follow-ups"],
  ["proposal.view", "View proposals"], ["proposal.create", "Create proposals"],
  ["project.view", "View projects"], ["project.create", "Create projects"], ["project.view_all", "View all company projects"], ["project.view_department", "View department projects"], ["project.view_assigned", "View assigned projects"], ["project.edit", "Edit projects"], ["project.archive", "Archive projects"], ["project.manage_members", "Manage project members"], ["project.assign_tasks", "Assign project tasks"], ["project.manage_modules", "Manage project modules"], ["project.manage_milestones", "Manage project milestones"], ["project.view_activity", "View project activity"], ["project.upload_documents", "Upload project documents"], ["task.view", "View tasks"], ["task.create", "Create tasks"],
  ["finance.view", "View finance"], ["finance.transaction.create", "Create transactions"], ["finance.invoice.view", "View invoices"],
  ["infrastructure.view", "View infrastructure"], ["infrastructure.manage", "Manage infrastructure"], ["infrastructure.incident.manage", "Manage incidents"],
  ["infrastructure.demo.launch", "Launch demo environments"], ["infrastructure.demo.stop", "Stop demo environments"],
];
for (const [key, description] of permissionData) await prisma.permission.upsert({ where: { key }, update: { description }, create: { key, description } });
const roleNames = ["Owner", "Admin", "Business", "Technical", "Member"];
for (const name of roleNames) await prisma.role.upsert({ where: { name }, update: {}, create: { name, description: `${name} workspace role`, isSystem: true } });
const owner = await prisma.role.findUniqueOrThrow({ where: { name: "Owner" } });
const permissions = await prisma.permission.findMany();
for (const permission of permissions) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: owner.id, permissionId: permission.id } }, update: {}, create: { roleId: owner.id, permissionId: permission.id } });
const business = await prisma.role.findUniqueOrThrow({ where: { name: "Business" } });
const businessKeys = new Set(["dashboard.view", "lead.view", "lead.create", "lead.edit", "lead.assign", "lead.convert", "client.view", "client.create", "client.edit", "meeting.view", "meeting.create", "meeting.edit", "meeting.complete", "follow_up.view", "follow_up.create", "follow_up.edit", "proposal.view", "proposal.create"]);
for (const permission of permissions.filter((item) => businessKeys.has(item.key))) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: business.id, permissionId: permission.id } }, update: {}, create: { roleId: business.id, permissionId: permission.id } });
const technical = await prisma.role.findUniqueOrThrow({ where: { name: "Technical" } });
const technicalKeys = new Set(["dashboard.view", "infrastructure.view", "infrastructure.manage", "infrastructure.incident.manage", "infrastructure.demo.launch", "infrastructure.demo.stop", "project.view", "task.view", "task.create"]);
for (const permission of permissions.filter((item) => technicalKeys.has(item.key))) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: technical.id, permissionId: permission.id } }, update: {}, create: { roleId: technical.id, permissionId: permission.id } });
const admin = await prisma.role.findUniqueOrThrow({ where: { name: "Admin" } });
for (const permission of permissions) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: admin.id, permissionId: permission.id } }, update: {}, create: { roleId: admin.id, permissionId: permission.id } });
const member = await prisma.role.findUniqueOrThrow({ where: { name: "Member" } });
const memberReadKeys = new Set(["dashboard.view", "lead.view", "client.view", "meeting.view", "follow_up.view", "project.view", "task.view", "finance.view", "finance.invoice.view", "infrastructure.view"]);
for (const permission of permissions.filter((item) => memberReadKeys.has(item.key))) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: member.id, permissionId: permission.id } }, update: {}, create: { roleId: member.id, permissionId: permission.id } });

const departments = [
  ["EXECUTIVE", "Executive"], ["TECHNOLOGY", "Technology"], ["FINANCE", "Finance"],
  ["MARKETING_SALES", "Marketing & Sales"], ["HUMAN_RESOURCES", "Human Resources"], ["OPERATIONS", "Operations"],
];
for (const [code, name] of departments) await prisma.department.upsert({ where: { code }, update: { name }, create: { code, name } });

const organizationalRoles = ["CEO", "CTO", "CFO", "CMO", "HR", "MANAGER", "EMPLOYEE", "INTERN"];
for (const name of organizationalRoles) await prisma.role.upsert({ where: { name }, update: { isSystem: true }, create: { name, description: `${name} organizational role`, isSystem: true } });
const orgPermissions = {
  CEO: ["dashboard.view", "project.view_all", "project.view_activity", "team.view", "finance.view", "lead.view", "client.view", "activity.view"],
  CTO: ["dashboard.view", "project.view_department", "project.create", "project.edit", "project.manage_members", "project.assign_tasks", "project.manage_modules", "project.view_activity", "task.view", "task.create", "infrastructure.view"],
  CFO: ["dashboard.view", "project.view_all", "finance.view", "finance.invoice.view", "finance.transaction.create", "activity.view"],
  CMO: ["dashboard.view", "project.view_all", "lead.view", "lead.create", "lead.edit", "client.view", "client.create", "meeting.view", "proposal.view"],
  HR: ["dashboard.view", "team.view", "team.manage", "project.view_all", "project.view_activity"],
  MANAGER: ["dashboard.view", "project.view_department", "project.create", "project.edit", "project.manage_members", "project.assign_tasks", "project.manage_modules", "project.view_activity", "task.view", "task.create", "meeting.view", "meeting.create"],
  EMPLOYEE: ["dashboard.view", "project.view_assigned", "project.view_activity", "task.view", "task.create", "meeting.view"],
  INTERN: ["dashboard.view", "project.view_assigned", "task.view", "meeting.view"],
};
for (const [roleName, keys] of Object.entries(orgPermissions)) {
  const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
  for (const permission of permissions.filter((item) => keys.includes(item.key))) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } }, update: {}, create: { roleId: role.id, permissionId: permission.id } });
}

const technology = await prisma.department.findUniqueOrThrow({ where: { code: "TECHNOLOGY" } });
const finance = await prisma.department.findUniqueOrThrow({ where: { code: "FINANCE" } });
const executive = await prisma.department.findUniqueOrThrow({ where: { code: "EXECUTIVE" } });
const initialAssignments = {
  "loukik.salvi@tattvatech.co.in": { departmentId: executive.id, roles: ["CEO", "CFO", "CMO", "HR", "MANAGER"] },
  "abhijeet.jadhav@tattvatech.co.in": { departmentId: finance.id, roles: ["CFO", "CMO", "HR", "MANAGER"] },
  "rishit.singh@tattvatech.co.in": { departmentId: technology.id, roles: ["CTO", "CFO", "CMO", "HR", "MANAGER", "EMPLOYEE", "INTERN"] },
  "raunak.singh@tattvatech.co.in": { departmentId: technology.id, roles: ["CTO", "CFO", "CMO", "HR", "MANAGER"] },
};
for (const [email, assignment] of Object.entries(initialAssignments)) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) { console.warn(`Expected role-assignment user not found: ${email}`); continue; }
  await prisma.user.update({ where: { id: user.id }, data: { departmentId: assignment.departmentId } });
  for (const roleName of assignment.roles) {
    const role = await prisma.role.findUniqueOrThrow({ where: { name: roleName } });
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: user.id, roleId: role.id } }, update: {}, create: { userId: user.id, roleId: role.id } });
  }
}

const projectFamilies = [["1", "WhatsApp Bot"], ["2", "ERP"], ["3", "Website"], ["4", "AI Solutions"], ["5", "Automation"], ["6", "Internal Systems"]];
for (const [code, name] of projectFamilies) await prisma.projectFamily.upsert({ where: { code }, update: { name }, create: { code, name } });
console.log("Foundation seed applied. Create an initial user with npm run db:create-user.");
await prisma.$disconnect();
