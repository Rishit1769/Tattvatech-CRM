import { LoginForm } from "@/components/auth/login-form";
import { AuthShell } from "@/components/auth/auth-shell";
export default function LoginPage() {
  return <AuthShell title="Welcome back." description="Sign in to your TattvaTech workspace."><LoginForm /></AuthShell>;
}
