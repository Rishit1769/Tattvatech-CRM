import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { AuthShell } from "@/components/auth/auth-shell";
export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.forcePasswordChange) redirect("/dashboard");
  return <AuthShell title="Make it yours." description="Set a new password of at least eight characters before entering your workspace."><ChangePasswordForm /></AuthShell>;
}
