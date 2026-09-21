"use client";
import { useState } from "react";
import { CreateForm, ResourcePage, useResource } from "@/components/ui/resource";
import { Field, Input, Select, StatusBadge, Notice } from "@/components/ui/primitives";
type Client = { id: string; name: string };
type Project = { id: string; projectCode: string; name: string; status: string; client: Client; _count: { tasks: number; milestones: number } };
const empty = { name: "", clientId: "", type: "", dealValue: "", expectedDeliveryDate: "" };
export function ProjectsPage() {
  const [form, setForm] = useState(empty);
  const clients = useResource<Client[]>("/api/clients", "clients");
  return <ResourcePage<Project> eyebrow="04 / Delivery" title="From intent to impact." description="Keep delivery visible. Connect each project to its client, milestones, and next steps." endpoint="/api/projects" resourceKey="projects" searchText={(project) => `${project.name} ${project.projectCode} ${project.client.name} ${project.status}`}
    columns={[
      { label: "Project", render: (project) => <><p className="record-title">{project.name}</p><p className="record-meta mono">{project.projectCode}</p></> },
      { label: "Client", render: (project) => <><p>{project.client.name}</p><p className="record-meta">{project._count.tasks} tasks · {project._count.milestones} milestones</p></> },
      { label: "Status", render: (project) => <StatusBadge status={project.status} /> },
    ]}
    form={(reload) => <CreateForm title="New project" endpoint="/api/projects" payload={() => ({ ...form, dealValue: form.dealValue ? Number(form.dealValue) : undefined })} reset={() => setForm(empty)} reload={reload} submitLabel="Create project ↗">
      {clients.error && <Notice>{clients.error}</Notice>}
      <Field label="Project name *"><Input required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Client *" hint={!clients.loading && !clients.data?.length ? "Add a client in the client directory first." : undefined}><Select required value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}><option value="">{clients.loading ? "Loading clients…" : "Select client"}</option>{clients.data?.map((client) => <option value={client.id} key={client.id}>{client.name}</option>)}</Select></Field>
      <Field label="Type"><Input maxLength={100} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Field>
      <Field label="Deal value (INR)"><Input type="number" min="0" step="0.01" value={form.dealValue} onChange={(e) => setForm({ ...form, dealValue: e.target.value })} /></Field>
      <Field label="Expected delivery"><Input type="date" value={form.expectedDeliveryDate} onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })} /></Field>
    </CreateForm>} />;
}
