import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { ClientsPage } from "@/components/crm/crm-page";

export default async function ClientsRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); return <WorkspaceShell user={user}><ClientsPage /></WorkspaceShell>; }
