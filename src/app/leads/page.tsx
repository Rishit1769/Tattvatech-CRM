import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { LeadsPage } from "@/components/crm/crm-page";

export default async function LeadsRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); return <WorkspaceShell user={user}><LeadsPage /></WorkspaceShell>; }
