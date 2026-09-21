import type { ReactNode } from "react";
import { PageHeader } from "@/components/ui/primitives";
export function AuthShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <main className="auth-layout"><aside className="auth-story"><div className="wordmark">Tattva<span>Tech</span></div><div><p className="eyebrow">The company workspace</p><p className="auth-statement">Clarity.<br />Precision.<br /><span>Purpose.</span></p><p>A connected space for the relationships, projects, and operations that move us forward.</p></div><footer className="eyebrow">Technology that transforms.</footer></aside><div className="auth-form"><section><PageHeader eyebrow="Workspace / Access" title={title} description={description} />{children}<p className="record-meta mt-8">Internal access only. Contact your administrator if you need help signing in.</p></section></div></main>;
}
