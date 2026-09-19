import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const root = process.cwd();
const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST ?? "127.0.0.1",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  database: process.env.DATABASE_NAME ?? "tattvatech_crm",
  user: process.env.DATABASE_USER ?? "tattvatech",
  password: process.env.DATABASE_PASSWORD ?? "",
  multipleStatements: true,
});

await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (filename VARCHAR(255) PRIMARY KEY, applied_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6))`);
const [appliedRows] = await connection.query("SELECT filename FROM schema_migrations ORDER BY filename");
const applied = new Set(appliedRows.map((row) => row.filename));
const files = (await readdir(path.join(root, "database/migrations"))).filter((file) => file.endsWith(".sql")).sort();

for (const filename of files) {
  if (applied.has(filename)) continue;
  const sql = await readFile(path.join(root, "database/migrations", filename), "utf8");
  await connection.beginTransaction();
  try {
    await connection.query(sql);
    await connection.query("INSERT INTO schema_migrations (filename) VALUES (?)", [filename]);
    await connection.commit();
    console.log(`Applied ${filename}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}
await connection.end();
