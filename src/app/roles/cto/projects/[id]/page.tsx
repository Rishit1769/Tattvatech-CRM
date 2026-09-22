import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ProjectDetailPage } from "@/components/projects/project-detail-page";
export default async function CtoProjectDetailRoute({ params }: { params: Promise<{ id: string }> }) { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.forcePasswordChange) redirect("/change-password"); if (!user.permissions.includes("project.view_all")) redirect("/dashboard"); const { id } = await params; return <WorkspaceShell user={user}><ProjectDetailPage id={id} /></WorkspaceShell>; }
