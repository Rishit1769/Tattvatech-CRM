import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { FinanceProjectForm } from "@/components/finance/finance-project-form";
export default async function FinanceCreateProjectRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.forcePasswordChange) redirect("/change-password"); if (!user.permissions.includes("finance.project.create")) redirect("/finance"); return <WorkspaceShell user={user}><section><div className="page-header"><div><p className="eyebrow">05 / Finance / Projects</p><h1>Create a business project.</h1><p>Finance creates the business handoff. The project starts in Planning and the CTO is notified for technical review.</p></div></div><FinanceProjectForm /></section></WorkspaceShell>; }
