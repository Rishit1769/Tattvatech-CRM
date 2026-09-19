import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { SearchPage } from "@/components/workspace/search-page";

export default async function SearchRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); return <WorkspaceShell user={user}><SearchPage /></WorkspaceShell>; }
