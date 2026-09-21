"use client";
import Link from "next/link";
import { useResource } from "@/components/ui/resource";
import { Button, EmptyState, LoadingSkeleton, Notice, PageHeader, SectionHeader, StatusBadge, humanize } from "@/components/ui/primitives";
type Server = { id: string; name: string; ownershipClass: string; status: string; services: { name: string; status: string; isCore: boolean }[]; _count: { incidents: number } };
export function InfrastructurePage() {
  const { data: servers, loading, error, reload } = useResource<Server[]>("/api/infrastructure/servers", "servers");
  return <section><PageHeader eyebrow="08 / Operations" title="Engineering, in view." description="Registered servers, core services, and their recorded operational state." action={<Link className="button button-secondary" href="/infrastructure/demos">Demo environments ↗</Link>} />
    <SectionHeader title="Server inventory" meta={<Button variant="ghost" onClick={() => void reload()} disabled={loading}>Refresh ↻</Button>} />
    {error && <Notice>{error}</Notice>}
    {loading ? <LoadingSkeleton /> : !error && (!servers?.length ? <EmptyState title="No servers registered" description="Your infrastructure inventory will appear here once servers are registered." /> : <div className="service-grid">{servers.map((server) => <article className="server-panel" key={server.id}>
      <SectionHeader title={server.name} meta={<StatusBadge status={server.status} />} /><p className="eyebrow mb-6">{humanize(server.ownershipClass)}</p>
      <p className="eyebrow mb-4">Services / {server.services.length}</p>
      {server.services.length ? server.services.map((service, index) => <div className="service-row" key={index}><div><p className="record-title">{service.name}</p>{service.isCore && <p className="record-meta">Core service</p>}</div><StatusBadge status={service.status} /></div>) : <p className="muted">No services registered.</p>}
      <p className="record-meta mt-6">{server._count.incidents} recorded incidents</p>
    </article>)}</div>)}
  </section>;
}
