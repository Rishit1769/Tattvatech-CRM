"use client";
import Link from "next/link";
import { useResource } from "@/components/ui/resource";
import { Button, LoadingSkeleton, Notice, money } from "@/components/ui/primitives";
type Metrics = { activeLeads: number; pipelineValue: string | null; activeProjects: number; received: string | null; openIncidents: number; runningDemos: number; lifecycle: { planning: number; development: number; testing: number; deployment: number; deployed: number; paymentPending: number; paymentReceived: number } };
export function DashboardMetrics() {
  const { data, loading, error, reload } = useResource<Metrics>("/api/dashboard/summary");
  if (loading) return <div className="metric-grid">{Array.from({ length: 6 }, (_, i) => <div className="metric" key={i}><LoadingSkeleton rows={1} /></div>)}</div>;
  if (error || !data) return <Notice>{error || "Metrics unavailable."}<br /><Button variant="secondary" onClick={() => void reload()}>Try again</Button></Notice>;
  const metrics = [
    ["Active leads", data.activeLeads, "Explore pipeline", "/leads"],
    ["Pipeline value", money(data.pipelineValue), "Open opportunities", "/leads"],
    ["Active projects", data.activeProjects, "View delivery", "/projects"],
    ["Received · all time", money(data.received), "View transactions", "/finance"],
    ["Open incidents", data.openIncidents, "View infrastructure", "/infrastructure"],
    ["Active demo requests", data.runningDemos, "Requested, starting & running", "/infrastructure/demos"],
    ["Planning", data.lifecycle.planning, "Project lifecycle", "/projects"],
    ["Development", data.lifecycle.development, "Project lifecycle", "/projects"],
    ["Testing", data.lifecycle.testing, "Project lifecycle", "/projects"],
    ["Deployment", data.lifecycle.deployment, "Deployment-stage projects", "/projects?lifecycle=DEPLOYED"],
    ["Deployed", data.lifecycle.deployed, "Live project records", "/projects"],
    ["Payment pending", data.lifecycle.paymentPending, "Awaiting finance confirmation", "/projects?payment=PENDING"],
    ["Payment received", data.lifecycle.paymentReceived, "Paid project records", "/projects?payment=PAID"],
  ];
  return <div className="metric-grid">{metrics.map(([label, value, hint, href], index) => <article className="metric" key={String(label)}><div className="metric-top"><span className="mono">{String(index + 1).padStart(2, "0")}</span><h3 className="eyebrow">{label}</h3></div><p className="metric-value">{value}</p><Link href={String(href)}>{hint}<span aria-hidden="true">↗</span></Link></article>)}</div>;
}
