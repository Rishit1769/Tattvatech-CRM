"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useResource } from "@/components/ui/resource";
import { EmptyState, Input, LoadingSkeleton, Notice, SectionHeader, StatusBadge } from "@/components/ui/primitives";

type BoardProject = { id: string; projectCode: string; name: string; lifecycleStatus: string; paymentStatus: string; expectedDeliveryDate?: string | null; client?: { name: string } | null; technicalOwner?: { fullName: string } | null; progress?: number | null };
const columns = [["PLANNING", "Planning"], ["DEVELOPMENT", "Development"], ["TESTING", "Testing"], ["DEPLOYMENT", "Deployment"], ["PAYMENT_PENDING", "Payment Pending"], ["PAYMENT_RECEIVED", "Payment Received"]] as const;
export function CtoProjectBoard() {
  const searchParams = useSearchParams();
  const endpoint = `/api/projects${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
  const { data, loading, error } = useResource<BoardProject[]>(endpoint, "projects");
  const [search, setSearch] = useState("");
  const projects = useMemo(() => (data ?? []).filter((project) => `${project.name} ${project.projectCode} ${project.client?.name ?? ""}`.toLowerCase().includes(search.toLowerCase())), [data, search]);
  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <Notice>{error}</Notice>;
  return <section className="section"><SectionHeader title="Project management" meta="One project record, technical and payment state separated" /><Input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search project, code, or client…" /><div className="project-board">{columns.map(([stage, label]) => { const cards = stage === "PAYMENT_PENDING" ? projects.filter((project) => ["PENDING", "PARTIALLY_PAID"].includes(project.paymentStatus)) : stage === "PAYMENT_RECEIVED" ? projects.filter((project) => project.paymentStatus === "PAID") : projects.filter((project) => project.lifecycleStatus === stage || (stage === "DEPLOYMENT" && project.lifecycleStatus === "DEPLOYED")); return <div className="project-board-column" key={stage}><h3>{label} <span>{cards.length}</span></h3>{cards.length ? cards.map((project) => <Link className="project-board-card" href={`/roles/cto/projects/${project.id}`} key={project.id}><p className="eyebrow mono">{project.projectCode}</p><strong>{project.name}</strong><p>{project.client?.name ?? "Internal project"}</p><p className="record-meta">Technical owner · {project.technicalOwner?.fullName ?? "Unassigned"}</p>{project.progress !== null && project.progress !== undefined && <p className="record-meta">Progress · {project.progress}%</p>}<StatusBadge status={stage.startsWith("PAYMENT") ? project.paymentStatus : project.lifecycleStatus} /></Link>) : <EmptyState title="No projects" description="Projects enter this stage through the shared lifecycle." />}</div>; })}</div></section>;
}
