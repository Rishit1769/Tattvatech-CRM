import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { FinancePage } from "@/components/finance/finance-page";
export default async function FinanceQuotationsRoute() { const user = await getCurrentUser(); if (!user) redirect("/login"); if (user.forcePasswordChange) redirect("/change-password"); if (!user.financeAccess) redirect("/dashboard"); return <WorkspaceShell user={user}><FinancePage initialView="quotations" /></WorkspaceShell>; }
