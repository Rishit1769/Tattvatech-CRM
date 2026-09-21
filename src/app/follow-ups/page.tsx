import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";

export default async function FollowUpsRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.forcePasswordChange) redirect("/change-password"); return <WorkspaceShell user={user}><div><p className="text-sm font-medium text-brand-600">Sales & CRM</p><h1 className="text-3xl font-semibold text-ink">Follow-ups</h1><p className="mt-2 text-slate">Follow-up records and due dates are available through the `/api/follow-ups` service.</p></div></WorkspaceShell>; }
