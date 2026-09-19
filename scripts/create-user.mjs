import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const required = ["BOOTSTRAP_NAME", "BOOTSTRAP_EMAIL", "BOOTSTRAP_PASSWORD"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`${key} is required`);
}

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST ?? "127.0.0.1",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  database: process.env.DATABASE_NAME ?? "tattvatech_crm",
  user: process.env.DATABASE_USER ?? "tattvatech",
  password: process.env.DATABASE_PASSWORD ?? "",
});

const roleName = process.env.BOOTSTRAP_ROLE ?? "Owner";
const [roles] = await connection.query("SELECT id FROM roles WHERE name = ? LIMIT 1", [roleName]);
if (!roles[0]) throw new Error(`Role not found: ${roleName}. Run npm run db:seed first.`);

const passwordHash = await bcrypt.hash(process.env.BOOTSTRAP_PASSWORD, 12);
await connection.query(
  `INSERT INTO users (id, full_name, email, password_hash, role_id, status)
   VALUES (UUID(), ?, LOWER(?), ?, ?, 'ACTIVE')`,
  [process.env.BOOTSTRAP_NAME, process.env.BOOTSTRAP_EMAIL, passwordHash, roles[0].id],
);
await connection.end();
console.log(`Created active ${roleName} user: ${process.env.BOOTSTRAP_EMAIL.toLowerCase()}`);
