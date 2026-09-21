import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { SchedulePage } from "@/components/workspace/schedule-page";
export default async function FollowUpsRoute() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.forcePasswordChange) redirect("/change-password");
  return <WorkspaceShell user={user}><SchedulePage kind="follow-ups" /></WorkspaceShell>;
}
