import { putPrivateObject } from "@/lib/storage/minio";

export async function queueInvoicePdf(input: { invoiceNumber: string; bytes: Buffer }) {
  return putPrivateObject({ objectKey: `invoices/${new Date().getUTCFullYear()}/${String(new Date().getUTCMonth() + 1).padStart(2, "0")}/${input.invoiceNumber}/${input.invoiceNumber}.pdf`, contentType: "application/pdf", body: input.bytes });
}
