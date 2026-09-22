import Link from "next/link";
import { PageHeader, SectionHeader } from "@/components/ui/primitives";
import { roleNavigation } from "@/lib/navigation/role-navigation";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { DeployedProjects } from "@/components/dashboard/deployed-projects";
import { CtoProjectBoard } from "@/components/roles/cto-project-board";

export function RoleOverview({ roleKey }: { roleKey: string }) {
  const role = roleNavigation.find((item) => item.key === roleKey);
  if (!role) return null;
  const links = role.items.filter((item) => item.href).slice(1);
  return <><PageHeader eyebrow={`Role / ${role.label}`} title={`${role.label} overview.`} description={`A focused workspace for ${role.label.toLowerCase()} responsibilities, using the same TattvaTech records and permission model.`} />{(role.key === "CTO" || role.key === "CEO") && <><SectionHeader title={role.key === "CTO" ? "Technical snapshot" : "Executive snapshot"} meta="Live workspace metrics" /><DashboardMetrics />{role.key === "CTO" && <><DeployedProjects /><CtoProjectBoard /></>}</>}<SectionHeader title={`${role.label} workspace`} meta="Permission-aware navigation" /><div className="route-grid">{links.map((item) => <Link className="route-card" href={item.href!} key={item.label}><p className="eyebrow">{role.label} <span aria-hidden="true">↗</span></p><h3>{item.label}</h3><p>Open the existing module with the permissions assigned to your account.</p></Link>)}</div></>;
}
