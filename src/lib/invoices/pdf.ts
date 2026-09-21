function pdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)").replaceAll("\n", " ").slice(0, 180);
}

export function buildInvoicePdf(input: { invoiceNumber: string; companyName: string; invoiceDate: string; product: string; amount: number; notes?: string }) {
  const lines = [
    ["50", "770", "22", "TattvaTech Invoice"],
    ["50", "730", "12", `Invoice: ${input.invoiceNumber}`],
    ["50", "710", "12", `Date: ${input.invoiceDate}`],
    ["50", "670", "14", `Bill to: ${input.companyName}`],
    ["50", "630", "12", `Product: ${input.product}`],
    ["50", "590", "12", `Amount: INR ${input.amount.toFixed(2)}`],
    ...(input.notes ? [["50", "550", "11", `Notes: ${input.notes}`]] : []),
  ];
  const commands = ["BT", "/F1 22 Tf", ...lines.map(([x, y, size, text]) => `/F1 ${size} Tf ${x} ${y} Td (${pdfText(text)}) Tj 0 -20 Td`), "ET"].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(commands, "ascii")} >>\nstream\n${commands}\nendstream`,
  ];
  let output = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(output, "ascii")); output += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const xrefOffset = Buffer.byteLength(output, "ascii");
  output += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.slice(1).map((offset) => `${String(offset).padStart(10, "0")} 00000 n `).join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return Buffer.from(output, "ascii");
}
