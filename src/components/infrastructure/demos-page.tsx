"use client";
import { useState } from "react";
import { CreateForm, jsonRequest, useResource } from "@/components/ui/resource";
import { Button, DataTable, EmptyState, Field, LoadingSkeleton, Notice, PageHeader, SectionHeader, Select, StatusBadge } from "@/components/ui/primitives";
type Demo = { id: string; templateKey: string; status: string; expiresAt: string; sampleProfile: string | null };
export function DemosPage() {
  const { data: demos, loading, error, reload } = useResource<Demo[]>("/api/infrastructure/demos", "demos");
  const [templateKey, setTemplateKey] = useState("school-erp");
  const [pendingId, setPendingId] = useState("");
  const [confirmId, setConfirmId] = useState("");
  const [actionError, setActionError] = useState("");
  const [success, setSuccess] = useState("");
  async function stop(id: string) {
    setPendingId(id); setActionError(""); setSuccess("");
    try { await jsonRequest(`/api/infrastructure/demos/${id}/stop`, { method: "POST" }); setConfirmId(""); setSuccess("Stop request recorded."); await reload(); }
    catch (e) { setActionError(e instanceof Error ? e.message : "Unable to stop demo."); }
    finally { setPendingId(""); }
  }
  return <section><PageHeader eyebrow="09 / Environments" title="Space to demonstrate." description="Temporary environments with synthetic data, explicit expiry, and visible lifecycle states." />
    <div className="work-grid"><div className="records"><SectionHeader title="Environment registry" meta={<Button variant="ghost" disabled={loading} onClick={() => void reload()}>Refresh ↻</Button>} />
      {(error || actionError) && <Notice>{error || actionError}</Notice>}{success && <Notice success>{success}</Notice>}
      {loading ? <LoadingSkeleton /> : !error && (!demos?.length ? <EmptyState title="No demo environments" description="Choose a template to request your first environment. A request is not a running deployment." /> : <DataTable rows={demos} caption="Demo environments" columns={[
        { label: "Environment", render: (demo) => <><p className="record-title">{demo.templateKey}</p><p className="record-meta">{demo.sampleProfile || "Synthetic data"}</p></> },
        { label: "Lifecycle", render: (demo) => <><StatusBadge status={demo.status} /><p className="record-meta">Expires {new Date(demo.expiresAt).toLocaleString("en-IN")}</p></> },
        { label: "Actions", render: (demo) => ["STOPPED", "EXPIRED"].includes(demo.status) ? <span className="muted">—</span> : confirmId === demo.id ? <div className="form-stack"><p className="record-meta">Stop this environment?</p><Button variant="danger" disabled={!!pendingId} onClick={() => void stop(demo.id)}>{pendingId === demo.id ? "Stopping…" : "Confirm stop"}</Button><Button variant="ghost" disabled={!!pendingId} onClick={() => setConfirmId("")}>Cancel</Button></div> : <Button variant="secondary" disabled={!!pendingId} onClick={() => setConfirmId(demo.id)}>Stop</Button> },
      ]} />)}
    </div><CreateForm title="Request an environment" description="Select a template. Requests expire after six hours; provisioning status appears in the registry." endpoint="/api/infrastructure/demos" payload={() => ({ templateKey, expiryHours: 6 })} reset={() => undefined} reload={reload} submitLabel="Request demo ↗"><Field label="Template"><Select value={templateKey} onChange={(e) => setTemplateKey(e.target.value)}><option value="school-erp">School ERP</option><option value="college-erp">College ERP</option><option value="custom">Custom</option></Select></Field></CreateForm></div>
  </section>;
}
