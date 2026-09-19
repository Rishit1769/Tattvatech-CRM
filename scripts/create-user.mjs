import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const required = ["BOOTSTRAP_NAME", "BOOTSTRAP_EMAIL", "BOOTSTRAP_PASSWORD"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}

const prisma = new PrismaClient();

const roleName = process.env.BOOTSTRAP_ROLE ?? "Owner";
const role = await prisma.role.findUnique({ where: { name: roleName } });
if (!role) throw new Error(`Role not found: ${roleName}. Run npm run db:seed first.`);

const passwordHash = await bcrypt.hash(process.env.BOOTSTRAP_PASSWORD, 12);
await prisma.user.create({ data: { fullName: process.env.BOOTSTRAP_NAME, email: process.env.BOOTSTRAP_EMAIL.toLowerCase(), passwordHash, roleId: role.id, status: "ACTIVE" } });
await prisma.$disconnect();
console.log(`Created active ${roleName} user: ${process.env.BOOTSTRAP_EMAIL.toLowerCase()}`);
