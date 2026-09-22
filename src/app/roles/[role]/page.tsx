import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { rolesForUser } from "@/lib/navigation/role-navigation";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { RoleOverview } from "@/components/roles/role-overview";

export default async function RoleOverviewRoute({ params }: { params: Promise<{ role: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.forcePasswordChange) redirect("/change-password");
  const { role: roleSlug } = await params;
  const roleKey = roleSlug.toUpperCase() === "SALES" ? "SALES" : roleSlug.toUpperCase() === "FINANCE" ? "FINANCE" : roleSlug.toUpperCase();
  const role = rolesForUser(user.roles).find((item) => item.key === roleKey);
  if (!role) notFound();
  return <WorkspaceShell user={user}><RoleOverview roleKey={role.key} /></WorkspaceShell>;
}
