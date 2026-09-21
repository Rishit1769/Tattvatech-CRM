"use client";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button, DataTable, EmptyState, Field, Input, LoadingSkeleton, Notice, PageHeader, SectionHeader, type Column } from "./primitives";

export async function jsonRequest(url: string, options?: RequestInit) {
  const response = await fetch(url, { ...options, headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.error ?? "The request could not be completed. Please try again.");
  if (!data) throw new Error("The server returned an invalid response.");
  return data;
}
export function useResource<T>(url: string, key?: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError("");
    try { const result = await jsonRequest(url, { signal }); if (!signal?.aborted) setData(key ? result[key] : result); }
    catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : "Unable to load records."); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [url, key]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  return { data, loading, error, reload: () => load() };
}
export function ResourcePage<T extends { id: string }>({ eyebrow, title, description, endpoint, resourceKey, columns, searchText, form }: {
  eyebrow: string; title: string; description: string; endpoint: string; resourceKey: string;
  columns: Column<T>[]; searchText: (row: T) => string; form?: (reload: () => Promise<void>) => ReactNode;
}) {
  const { data, error, loading, reload } = useResource<T[]>(endpoint, resourceKey);
  const [filter, setFilter] = useState("");
  const rows = (data ?? []).filter((row) => searchText(row).toLowerCase().includes(filter.trim().toLowerCase()));
  return <section><PageHeader eyebrow={eyebrow} title={title} description={description} />
    <div className={form ? "work-grid" : ""}><div className="records">
      <SectionHeader title="Records" meta={data ? `${data.length} loaded` : "—"} />
      <div className="toolbar"><Field label="Filter loaded records"><Input type="search" value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Name, reference or status…" /></Field><Button variant="ghost" onClick={() => void reload()} disabled={loading}>Refresh ↻</Button></div>
      {error && <Notice>{error}</Notice>}
      {loading ? <LoadingSkeleton /> : !error && (rows.length ? <DataTable rows={rows} columns={columns} caption={title} /> : <EmptyState title={filter ? "No matching records" : "No records yet"} description={filter ? "Try a different name or reference." : "Records will appear here as your team adds them."} />)}
      {data && !loading && <p className="record-meta mt-4">{rows.length} shown · Latest available records</p>}
    </div>{form?.(reload)}</div>
  </section>;
}
export function CreateForm({ title, description = "Fields marked * are required.", endpoint, payload, reset, reload, children, submitLabel }: {
  title: string; description?: string; endpoint: string; payload: () => unknown; reset: () => void; reload: () => Promise<void>; children: ReactNode; submitLabel: string;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (pending) return;
    setPending(true); setError(""); setSuccess(false);
    try { await jsonRequest(endpoint, { method: "POST", body: JSON.stringify(payload()) }); reset(); setSuccess(true); await reload(); }
    catch (e) { setError(e instanceof Error ? e.message : "Unable to save. Please try again."); }
    finally { setPending(false); }
  }
  return <aside className="form-panel"><h2>{title}</h2><p>{description}</p><form className="form-stack" onSubmit={submit} aria-busy={pending}>{error && <Notice>{error}</Notice>}{success && <Notice success>Record saved.</Notice>}<fieldset disabled={pending}><legend className="sr-only">{title}</legend>{children}<Button type="submit" disabled={pending}>{pending ? "Saving…" : submitLabel}</Button></fieldset></form></aside>;
}
