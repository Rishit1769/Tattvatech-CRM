import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { CtoProjectBoard } from "@/components/roles/cto-project-board";
export default async function CtoProjectsRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.forcePasswordChange) redirect("/change-password"); if (!user.permissions.includes("project.view_all")) redirect("/dashboard"); return <WorkspaceShell user={user}><section><div className="page-header"><div><p className="eyebrow">Role / CTO / Projects</p><h1>Technical project management.</h1><p>Review the organization-wide technical pipeline, then open a project to manage its implementation lifecycle.</p></div></div><CtoProjectBoard /></section></WorkspaceShell>; }
