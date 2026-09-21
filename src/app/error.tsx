"use client";
import Link from "next/link";
import { Button, PageHeader } from "@/components/ui/primitives";
export default function WorkspaceError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="workspace-main"><PageHeader eyebrow="Workspace / Unavailable" title="Let’s reconnect." description="This page could not be loaded. Please try again. If the problem continues, contact your administrator." /><div className="flex flex-wrap gap-4"><Button onClick={reset}>Try again</Button><Link className="button button-secondary" href="/dashboard">Back to workspace</Link></div></main>;
}
