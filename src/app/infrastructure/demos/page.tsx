import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { DemosPage } from "@/components/infrastructure/demos-page";

export default async function DemosRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); return <WorkspaceShell user={user}><DemosPage /></WorkspaceShell>; }
