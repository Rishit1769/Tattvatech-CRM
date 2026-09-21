"use client";
import { useState } from "react";
import { CreateForm, ResourcePage, useResource } from "@/components/ui/resource";
import { Field, Input, Select, StatusBadge, Notice, humanize, money } from "@/components/ui/primitives";
type Transaction = { id: string; transactionNumber: string; type: string; amount: string; currency: string; transactionDate: string; status: string; client?: { name: string } | null };
type Client = { id: string; name: string };
export function FinancePage() {
  const [form, setForm] = useState({ type: "PAYMENT_RECEIVED", clientId: "", amount: "", transactionDate: new Date().toISOString().slice(0, 10), paymentMethod: "Bank transfer", description: "" });
  const clients = useResource<Client[]>("/api/clients", "clients");
  return <ResourcePage<Transaction> eyebrow="05 / Finance" title="Every transaction, accounted for." description="Record payments, expenses, and transfers. Keep the financial picture clear." endpoint="/api/finance/transactions" resourceKey="transactions" searchText={(record) => `${record.transactionNumber} ${record.type} ${record.client?.name ?? ""} ${record.status}`}
    columns={[
      { label: "Transaction", render: (record) => <><p className="record-title mono">{record.transactionNumber}</p><p className="record-meta">{humanize(record.type)} · {record.client?.name ?? "Unlinked"}</p></> },
      { label: "Amount", render: (record) => <><p className="mono">{money(record.amount, record.currency)}</p><p className="record-meta">{new Date(record.transactionDate).toLocaleDateString("en-IN")}</p></> },
      { label: "Status", render: (record) => <StatusBadge status={record.status} /> },
    ]}
    form={(reload) => <CreateForm title="Record transaction" endpoint="/api/finance/transactions" payload={() => ({ ...form, amount: Number(form.amount), clientId: form.clientId || undefined })} reset={() => setForm({ ...form, amount: "", description: "" })} reload={reload} submitLabel="Save transaction ↗">
      <Field label="Type *"><Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>{["PAYMENT_RECEIVED", "EXPENSE", "REFUND", "TRANSFER", "OTHER_INCOME", "OTHER"].map((type) => <option value={type} key={type}>{humanize(type)}</option>)}</Select></Field>
      {clients.error && <Notice>Client choices could not be loaded. Refresh the page to retry.</Notice>}
      <Field label={`Client${form.type === "PAYMENT_RECEIVED" ? " *" : ""}`} hint="Required for received payments."><Select required={form.type === "PAYMENT_RECEIVED"} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}><option value="">{clients.loading ? "Loading clients…" : "Select client"}</option>{clients.data?.map((client) => <option value={client.id} key={client.id}>{client.name}</option>)}</Select></Field>
      <Field label="Amount (INR) *"><Input required type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></Field>
      <Field label="Date *"><Input required type="date" value={form.transactionDate} onChange={(e) => setForm({ ...form, transactionDate: e.target.value })} /></Field>
      <Field label="Payment method"><Input maxLength={60} value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} /></Field>
      <Field label="Description"><textarea className="input" rows={3} maxLength={5000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
    </CreateForm>} />;
}
