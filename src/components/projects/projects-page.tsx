"use client";
import { useState } from "react";
import Link from "next/link";
import { CreateForm, ResourcePage, useResource } from "@/components/ui/resource";
import { Field, Input, Select, StatusBadge, Notice } from "@/components/ui/primitives";
type Client = { id: string; name: string };
type Family = { id: string; code: string; name: string };
type Project = { id: string; projectCode: string; name: string; status: string; lifecycleStatus: string; projectType: string; family?: Family | null; client?: Client | null; _count: { tasks: number; milestones: number; members: number; modules: number } };
const empty = { name: "", familyId: "", clientId: "", projectType: "CLIENT_PROJECT", type: "", dealValue: "", expectedDeliveryDate: "" };
export function ProjectsPage() {
  const [form, setForm] = useState(empty);
  const clients = useResource<Client[]>("/api/clients", "clients");
  const families = useResource<Family[]>("/api/project-families", "families");
  return <ResourcePage<Project> eyebrow="04 / Delivery" title="Projects with context." description="Every project has a family, a stable human code, a clear owner, and scoped team access." endpoint="/api/projects" resourceKey="projects" searchText={(project) => `${project.name} ${project.projectCode} ${project.client?.name ?? ""} ${project.status} ${project.lifecycleStatus}`}
    columns={[
      { label: "Project", render: (project) => <><Link className="record-title" href={`/projects/${project.id}`}>{project.name}</Link><p className="record-meta mono">{project.projectCode} · {project.family?.name ?? "Uncategorized"}</p></> },
      { label: "Client / work", render: (project) => <><p>{project.client?.name ?? "Internal product"}</p><p className="record-meta">{project._count.tasks} tasks · {project._count.members} members · {project._count.modules} modules</p></> },
      { label: "Lifecycle", render: (project) => <><StatusBadge status={project.lifecycleStatus} /><p className="record-meta mt-2">Delivery: {project.status.replaceAll("_", " ")}</p></> },
    ]}
    form={(reload) => <CreateForm title="New project" endpoint="/api/projects" payload={() => ({ ...form, familyId: form.familyId || undefined, clientId: form.clientId || undefined, dealValue: form.dealValue ? Number(form.dealValue) : undefined })} reset={() => setForm(empty)} reload={reload} submitLabel="Create project ↗">
      {clients.error && <Notice>{clients.error}</Notice>}
      {families.error && <Notice>{families.error}</Notice>}
      <Field label="Project name *"><Input required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
      <Field label="Project family *"><Select required value={form.familyId} onChange={(e) => setForm({ ...form, familyId: e.target.value })}><option value="">{families.loading ? "Loading families…" : "Select family"}</option>{families.data?.map((family) => <option value={family.id} key={family.id}>{family.code} — {family.name}</option>)}</Select></Field>
      <Field label="Project type *"><Select required value={form.projectType} onChange={(e) => setForm({ ...form, projectType: e.target.value })}>{["INTERNAL_PRODUCT", "CLIENT_PROJECT", "INTERNAL_TOOL", "R_AND_D"].map((type) => <option value={type} key={type}>{type.replaceAll("_", " ")}</option>)}</Select></Field>
      <Field label="Client" hint="Required for client projects."><Select required={form.projectType === "CLIENT_PROJECT"} value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })}><option value="">{clients.loading ? "Loading clients…" : "Select client"}</option>{clients.data?.map((client) => <option value={client.id} key={client.id}>{client.name}</option>)}</Select></Field>
      <Field label="Type"><Input maxLength={100} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} /></Field>
      <Field label="Deal value (INR)"><Input type="number" min="0" step="0.01" value={form.dealValue} onChange={(e) => setForm({ ...form, dealValue: e.target.value })} /></Field>
      <Field label="Expected delivery"><Input type="date" value={form.expectedDeliveryDate} onChange={(e) => setForm({ ...form, expectedDeliveryDate: e.target.value })} /></Field>
    </CreateForm>} />;
}
