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
  ["project.view", "View projects"], ["project.create", "Create projects"], ["task.view", "View tasks"], ["task.create", "Create tasks"],
  ["finance.view", "View finance"], ["finance.transaction.create", "Create transactions"], ["finance.invoice.view", "View invoices"],
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
console.log("Foundation seed applied. Create an initial user with npm run db:create-user.");
await prisma.$disconnect();
