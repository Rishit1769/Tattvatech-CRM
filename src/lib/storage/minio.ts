import * as Minio from "minio";
import { env } from "@/lib/config/env";

let client: Minio.Client | null = null;
function getClient() {
  const accessKey = env.MINIO_ACCESS_KEY ?? env.MINIO_ROOT_USER;
  const secretKey = env.MINIO_SECRET_KEY ?? env.MINIO_ROOT_PASSWORD;
  if (!env.MINIO_ENDPOINT || !accessKey || !secretKey) throw new Error("STORAGE_NOT_CONFIGURED");
  return client ??= new Minio.Client({ endPoint: env.MINIO_ENDPOINT, port: env.MINIO_PORT, useSSL: env.MINIO_USE_SSL, accessKey, secretKey });
}

export async function putPrivateObject(input: { objectKey: string; contentType: string; body: Buffer }) {
  const storage = getClient();
  await storage.putObject(env.MINIO_BUCKET, input.objectKey, input.body, input.body.length, { "Content-Type": input.contentType });
  return { bucketName: env.MINIO_BUCKET, objectKey: input.objectKey, status: "STORED" as const };
}

export async function removePrivateObject(objectKey: string) {
  await getClient().removeObject(env.MINIO_BUCKET, objectKey);
}

export async function getPrivateObjectUrl(objectKey: string) {
  return getClient().presignedGetObject(env.MINIO_BUCKET, objectKey, 300);
}
