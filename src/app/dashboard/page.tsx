import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { DashboardMetrics } from "@/components/dashboard/dashboard-metrics";
import { DeployedProjects } from "@/components/dashboard/deployed-projects";
import { PageHeader, SectionHeader } from "@/components/ui/primitives";
export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.forcePasswordChange) redirect("/change-password");
  return <WorkspaceShell user={user}>
    <PageHeader eyebrow="01 / Overview" title="A clearer view of your business." description={`Welcome back, ${user.fullName.split(" ")[0]}. From first conversations to delivery, keep the work that matters in view.`} action={<Link className="button button-primary" href="/leads">Open pipeline <span aria-hidden="true">↗</span></Link>} />
    <SectionHeader title="Business at a glance" meta="Current snapshot" /><DashboardMetrics /><DeployedProjects />
    <section className="section"><SectionHeader title="Move the work forward" meta="Your workspace" /><div className="route-grid">{[
      ["01 / Relationships", "Build the next connection.", "Follow conversations, nurture opportunities, and grow client relationships.", "/clients"],
      ["02 / Delivery", "Keep progress visible.", "Connect projects to the people, tasks, and milestones behind them.", "/projects"],
      ["03 / Operations", "Know where things stand.", "Review registered servers, service states, and demo environments.", "/infrastructure"],
    ].map(([label, title, description, href]) => <Link className="route-card" href={href} key={href}><p className="eyebrow">{label} <span aria-hidden="true">↗</span></p><h3>{title}</h3><p>{description}</p></Link>)}</div></section>
  </WorkspaceShell>;
}
