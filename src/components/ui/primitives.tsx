import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</header>;
}
export function SectionHeader({ title, meta }: { title: string; meta?: ReactNode }) { return <div className="section-header"><h2>{title}</h2>{meta && <span className="mono muted">{meta}</span>}</div>; }
export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "danger" }) { return <button type={type} className={`button button-${variant} ${className}`} {...props} />; }
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={`input ${props.className ?? ""}`} />; }
export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} className={`input ${props.className ?? ""}`} />; }
export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) { return <label className="field"><span>{label}</span>{children}{hint && <span className="field-hint">{hint}</span>}</label>; }
export function humanize(value: string) { return value.toLowerCase().replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
export function StatusBadge({ status }: { status: string }) {
  const tone = ["ACTIVE", "RUNNING", "ONLINE", "OPERATIONAL", "HEALTHY", "PAID", "COMPLETED", "DONE", "WON", "POSTED"].includes(status) ? "success" : ["CRITICAL", "FAILED", "OFFLINE", "LOST", "VOID", "BLOCKED", "DOWN"].includes(status) ? "danger" : ["PENDING", "OVERDUE", "OPEN", "REQUESTED", "STARTING", "DEGRADED", "ON_HOLD"].includes(status) ? "warning" : "neutral";
  return <span className={`badge badge-${tone}`}>{humanize(status)}</span>;
}
export function EmptyState({ title, description }: { title: string; description: string }) { return <div className="empty-state"><h3>{title}</h3><p>{description}</p></div>; }
export function Notice({ children, success = false }: { children: ReactNode; success?: boolean }) { return <div className={`notice ${success ? "notice-success" : ""}`} role={success ? "status" : "alert"}>{children}</div>; }
export function LoadingSkeleton({ rows = 4 }: { rows?: number }) { return <div role="status" aria-label="Loading records" aria-busy="true">{Array.from({ length: rows }, (_, index) => <div className="skeleton-row" key={index} aria-hidden="true"><div className="skeleton" /><div className="skeleton" /></div>)}</div>; }
export type Column<T> = { label: string; render: (row: T) => ReactNode };
export function DataTable<T extends { id: string }>({ rows, columns, caption }: { rows: T[]; columns: Column<T>[]; caption: string }) { return <div className="table-wrap"><table className="data-table" role="table"><caption className="sr-only">{caption}</caption><thead role="rowgroup"><tr role="row">{columns.map((column) => <th scope="col" role="columnheader" key={column.label}>{column.label}</th>)}</tr></thead><tbody role="rowgroup">{rows.map((row) => <tr role="row" key={row.id}>{columns.map((column) => <td role="cell" data-label={column.label} key={column.label}><div>{column.render(row)}</div></td>)}</tr>)}</tbody></table></div>; }
export function money(value: string | number | null, currency = "INR") { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(value ?? 0)); }
