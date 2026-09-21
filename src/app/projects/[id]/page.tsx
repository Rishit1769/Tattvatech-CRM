import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ProjectDetailPage } from "@/components/projects/project-detail-page";

export default async function ProjectDetailRoute({ params }: { params: Promise<{ id: string }> }) { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.forcePasswordChange) redirect("/change-password"); const { id } = await params; return <WorkspaceShell user={user}><ProjectDetailPage id={id} /></WorkspaceShell>; }
