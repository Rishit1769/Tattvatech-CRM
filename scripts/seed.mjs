import { readFile } from "node:fs/promises";
import path from "node:path";
import mysql from "mysql2/promise";

const connection = await mysql.createConnection({
  host: process.env.DATABASE_HOST ?? "127.0.0.1",
  port: Number(process.env.DATABASE_PORT ?? 3306),
  database: process.env.DATABASE_NAME ?? "tattvatech_crm",
  user: process.env.DATABASE_USER ?? "tattvatech",
  password: process.env.DATABASE_PASSWORD ?? "",
  multipleStatements: true,
});
const sql = await readFile(path.join(process.cwd(), "database/seeds/001_foundation.sql"), "utf8");
await connection.query(sql);
await connection.end();
console.log("Foundation seed applied. Create an initial user through an administrative bootstrap flow before logging in.");
