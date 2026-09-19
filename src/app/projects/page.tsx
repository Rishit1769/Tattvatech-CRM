import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ProjectsPage } from "@/components/projects/projects-page";

export default async function ProjectsRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); return <WorkspaceShell user={user}><ProjectsPage /></WorkspaceShell>; }
