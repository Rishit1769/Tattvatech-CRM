import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
export default function NotFound() {
  return <AuthShell title="A missing connection." description="This page could not be found. It may have moved or the address may be incorrect."><Link href="/dashboard" className="button button-primary">Back to workspace ↗</Link></AuthShell>;
}
