import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { fullName: "Loukik Salvi", email: "loukik.salvi@tattvatech.co.in" },
  { fullName: "Rishit Singh", email: "rishit.singh@tattvatech.co.in" },
  { fullName: "Raunak Singh", email: "raunak.singh@tattvatech.co.in" },
  { fullName: "Abhijeet Jadhav", email: "abhijeet.jadhav@tattvatech.co.in" },
];

const TEMP_PASSWORD = "159753";
const roleName = "Member";

const role = await prisma.role.findUnique({ where: { name: roleName } });
if (!role) {
  console.error(`Role "${roleName}" not found. Run npm run db:seed first.`);
  process.exit(1);
}

const passwordHash = await bcrypt.hash(TEMP_PASSWORD, 12);

for (const { fullName, email } of users) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists, skipping.`);
    continue;
  }
  await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      roleId: role.id,
      status: "ACTIVE",
      forcePasswordChange: true,
    },
  });
  console.log(`Created user: ${email} (temp password: ${TEMP_PASSWORD})`);
}

await prisma.$disconnect();
console.log("Done.");
