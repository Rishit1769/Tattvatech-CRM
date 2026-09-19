import mysql, { type Pool, type PoolConnection, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";
import { env } from "@/lib/config/env";

declare global {
  // eslint-disable-next-line no-var
  var tattvaPool: Pool | undefined;
}

export const db = globalThis.tattvaPool ?? mysql.createPool({
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  database: env.DATABASE_NAME,
  user: env.DATABASE_USER,
  password: env.DATABASE_PASSWORD,
  connectionLimit: env.DATABASE_CONNECTION_LIMIT,
  waitForConnections: true,
  namedPlaceholders: true,
  timezone: "Z",
});

if (env.NODE_ENV !== "production") globalThis.tattvaPool = db;

export type DbRow = RowDataPacket & Record<string, unknown>;
export type DbResult = ResultSetHeader;

export async function withTransaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
