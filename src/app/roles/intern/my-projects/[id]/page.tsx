import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { AssignedProjectDetail } from "@/components/roles/assigned-project-detail";
export default async function InternProjectDetail({ params }: { params: Promise<{ id: string }> }) { const user = await getCurrentUser(); if (!user) redirect("/login"); if (!user.permissions.includes("project.view_assigned")) redirect("/dashboard"); const { id } = await params; return <WorkspaceShell user={user}><AssignedProjectDetail id={id} role="intern" /></WorkspaceShell>; }
