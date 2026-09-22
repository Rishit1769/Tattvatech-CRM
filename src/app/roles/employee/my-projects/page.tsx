import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AssignedProjectsPage } from "@/components/roles/assigned-projects-page";
export default async function EmployeeProjectsRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.forcePasswordChange) redirect("/change-password"); if (!user.permissions.includes("project.view_assigned")) redirect("/dashboard"); return <WorkspaceShell user={user}><AssignedProjectsPage role="employee" /></WorkspaceShell>; }
