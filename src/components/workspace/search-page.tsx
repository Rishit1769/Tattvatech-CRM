"use client";
import { useEffect, useState } from "react";
import { jsonRequest } from "@/components/ui/resource";
import { EmptyState, Field, Input, LoadingSkeleton, Notice, PageHeader, humanize } from "@/components/ui/primitives";
type Result = { type: string; id: string; label: string };
export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    setResults([]); setError("");
    if (query.trim().length < 2) { setLoading(false); return () => controller.abort(); }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try { const data = await jsonRequest(`/api/search?q=${encodeURIComponent(query.trim())}`, { signal: controller.signal }); if (!controller.signal.aborted) setResults(data.results); }
      catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Search failed."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }, 250);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [query]);
  return <section><PageHeader eyebrow="10 / Workspace" title="Find the thread." description="Look up clients, projects, invoices, and transactions from one place." />
    <Field label="Search workspace" hint="Enter at least two characters."><Input type="search" className="search-input" placeholder="A name, project, or reference…" value={query} onChange={(e) => setQuery(e.target.value)} /></Field>
    <div className="search-list">{error && <Notice>{error}</Notice>}{loading ? <LoadingSkeleton /> : !error && (results.length ? <><p role="status" className="record-meta">{results.length} results</p>{results.map((result) => <div className="search-result" key={`${result.type}-${result.id}`}><p className="record-title">{result.label}</p><span className="badge">{humanize(result.type)}</span></div>)}</> : <EmptyState title={query.trim().length < 2 ? "Start with a name" : "No results found"} description={query.trim().length < 2 ? "Search brings related records into view." : "Try a different name or a shorter reference."} />)}</div>
  </section>;
}
