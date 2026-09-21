import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { FinancePage } from "@/components/finance/finance-page";

export default async function FinanceRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.forcePasswordChange) redirect("/change-password"); return <WorkspaceShell user={user}><FinancePage initialView="overview" /></WorkspaceShell>; }
