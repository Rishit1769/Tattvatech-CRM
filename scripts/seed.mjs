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
];
for (const [key, description] of permissionData) await prisma.permission.upsert({ where: { key }, update: { description }, create: { key, description } });
const roleNames = ["Owner", "Admin", "Business", "Technical", "Member"];
for (const name of roleNames) await prisma.role.upsert({ where: { name }, update: {}, create: { name, description: `${name} workspace role`, isSystem: true } });
const owner = await prisma.role.findUniqueOrThrow({ where: { name: "Owner" } });
const permissions = await prisma.permission.findMany();
for (const permission of permissions) await prisma.rolePermission.upsert({ where: { roleId_permissionId: { roleId: owner.id, permissionId: permission.id } }, update: {}, create: { roleId: owner.id, permissionId: permission.id } });
console.log("Foundation seed applied. Create an initial user with npm run db:create-user.");
await prisma.$disconnect();
