import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { InfrastructurePage } from "@/components/infrastructure/infrastructure-page";

export default async function InfrastructureRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.forcePasswordChange) redirect("/change-password"); return <WorkspaceShell user={user}><InfrastructurePage /></WorkspaceShell>; }
