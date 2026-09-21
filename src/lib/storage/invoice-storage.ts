export type InvoiceStorageResult = { provider: "minio"; status: "DEFERRED"; objectKey: string };

/**
 * MinIO is intentionally not connected yet. Keeping this adapter boundary means
 * invoice generation can be tested now and the upload can be enabled later
 * without changing the finance API or storing PDF bytes in MySQL.
 */
export async function queueInvoicePdf(input: { invoiceNumber: string; bytes: Buffer }): Promise<InvoiceStorageResult> {
  void input.bytes;
  return { provider: "minio", status: "DEFERRED", objectKey: `invoices/${input.invoiceNumber}.pdf` };
}
