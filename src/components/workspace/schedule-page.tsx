"use client";
import { ResourcePage } from "@/components/ui/resource";
import { StatusBadge } from "@/components/ui/primitives";
type Entry = { id: string; title: string; status: string; scheduledStart?: string; dueAt?: string; client?: { name: string } | null; lead?: { organizationName: string } | null; meetingType?: string };
export function SchedulePage({ kind }: { kind: "meetings" | "follow-ups" }) {
  const meetings = kind === "meetings";
  return <ResourcePage<Entry> eyebrow={meetings ? "06 / Conversations" : "07 / Next actions"} title={meetings ? "Make time for progress." : "Keep the conversation moving."} description={meetings ? "Upcoming and recorded meetings, connected to your client relationships." : "Open follow-ups, ordered by due date. Keep the next action in sight."} endpoint={`/api/${kind}`} resourceKey={meetings ? "meetings" : "followUps"} searchText={(entry) => `${entry.title} ${entry.client?.name ?? ""} ${entry.lead?.organizationName ?? ""}`} columns={[
    { label: meetings ? "Meeting" : "Follow-up", render: (entry) => <><p className="record-title">{entry.title}</p><p className="record-meta">{entry.client?.name ?? entry.lead?.organizationName ?? "No linked relationship"}</p></> },
    { label: meetings ? "Scheduled" : "Due", render: (entry) => <span className="mono">{new Date((meetings ? entry.scheduledStart : entry.dueAt)!).toLocaleString("en-IN")}</span> },
    { label: "Status", render: (entry) => <StatusBadge status={entry.status} /> },
  ]} />;
}
