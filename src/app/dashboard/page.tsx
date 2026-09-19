import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <WorkspaceShell user={user}>
      <div className="mb-8">
        <p className="text-sm font-medium text-brand-600">Company Workspace</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink">Good to see you, {user.fullName.split(" ")[0]}</h1>
        <p className="mt-2 text-slate">Phase 0 foundation is ready. Business modules will be added phase by phase.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Authentication", "Secure session foundation", "Ready"],
          ["Access control", "Data-driven permissions", "Ready"],
          ["Storage", "MinIO integration", "Deferred"],
        ].map(([title, description, status]) => (
          <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm" key={title}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-ink">{title}</h2>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status === "Ready" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{status}</span>
            </div>
            <p className="mt-3 text-sm text-slate">{description}</p>
          </article>
        ))}
      </div>
    </WorkspaceShell>
  );
}
