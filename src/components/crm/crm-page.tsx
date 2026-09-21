"use client";
import { useState } from "react";
import { CreateForm, ResourcePage } from "@/components/ui/resource";
import { Field, Input, StatusBadge, money } from "@/components/ui/primitives";

type Lead = { id: string; organizationName: string; primaryContactName: string; interest: string | null; stage: string; expectedValue: string | number | null };
type Client = { id: string; clientCode: string; name: string; email: string | null; _count: { projects: number; meetings: number } };
const emptyLead = { organizationName: "", primaryContactName: "", email: "", interest: "", expectedValue: "" };
const emptyClient = { name: "", email: "", phone: "", industry: "" };

export function LeadsPage() {
  const [form, setForm] = useState(emptyLead);
  return <ResourcePage<Lead> eyebrow="02 / Relationships" title="Your next opportunity." description="A clear view of every conversation, from first contact to won business." endpoint="/api/leads" resourceKey="leads" searchText={(lead) => `${lead.organizationName} ${lead.primaryContactName} ${lead.stage}`}
    columns={[
      { label: "Opportunity", render: (lead) => <><p className="record-title">{lead.organizationName}</p><p className="record-meta">{lead.primaryContactName}</p></> },
      { label: "Stage", render: (lead) => <><StatusBadge status={lead.stage} /><p className="record-meta">{lead.interest || "Interest not set"}</p></> },
      { label: "Value", render: (lead) => <span className="mono">{lead.expectedValue === null ? "Not set" : money(lead.expectedValue)}</span> },
    ]}
    form={(reload) => <CreateForm title="New lead" endpoint="/api/leads" payload={() => ({ ...form, expectedValue: form.expectedValue ? Number(form.expectedValue) : undefined })} reset={() => setForm(emptyLead)} reload={reload} submitLabel="Create lead ↗">
      <Field label="Organization *"><Input required maxLength={200} value={form.organizationName} onChange={(e) => setForm({ ...form, organizationName: e.target.value })} /></Field>
      <Field label="Primary contact *"><Input required maxLength={160} value={form.primaryContactName} onChange={(e) => setForm({ ...form, primaryContactName: e.target.value })} /></Field>
      <Field label="Email"><Input type="email" maxLength={320} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <Field label="Interest"><Input maxLength={120} value={form.interest} onChange={(e) => setForm({ ...form, interest: e.target.value })} /></Field>
      <Field label="Expected value (INR)"><Input type="number" min="0" step="0.01" value={form.expectedValue} onChange={(e) => setForm({ ...form, expectedValue: e.target.value })} /></Field>
    </CreateForm>} />;
}
export function ClientsPage() {
  const [form, setForm] = useState(emptyClient);
  return <ResourcePage<Client> eyebrow="03 / Relationships" title="Built on relationships." description="One directory for the organizations you work with and the work you share." endpoint="/api/clients" resourceKey="clients" searchText={(client) => `${client.name} ${client.email ?? ""} ${client.clientCode}`}
    columns={[
      { label: "Organization", render: (client) => <><p className="record-title">{client.name}</p><p className="record-meta mono">{client.clientCode}</p></> },
      { label: "Contact", render: (client) => <span className="muted">{client.email || "No email recorded"}</span> },
      { label: "Relationships", render: (client) => <><p>{client._count.projects} projects</p><p className="record-meta">{client._count.meetings} meetings</p></> },
    ]}
    form={(reload) => <CreateForm title="New client" endpoint="/api/clients" payload={() => form} reset={() => setForm(emptyClient)} reload={reload} submitLabel="Create client ↗">
      <Field label="Organization *"><Input required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Email"><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
      <Field label="Phone"><Input type="tel" maxLength={40} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></Field>
      <Field label="Industry"><Input maxLength={120} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></Field>
    </CreateForm>} />;
}
