import type { ReactNode } from "react";
import { WorkspaceFrame } from "./workspace-frame";

// Keep the database user on the server; only public profile fields cross the client boundary.
export function WorkspaceShell({ user, children }: { user: { fullName: string; role: { name: string } }; children: ReactNode }) {
  return <WorkspaceFrame user={{ fullName: user.fullName, role: { name: user.role.name } }}>{children}</WorkspaceFrame>;
}
