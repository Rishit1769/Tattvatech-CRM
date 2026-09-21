"use client";
import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

const navigation = [
  ["Overview", "/dashboard"], ["Leads", "/leads"], ["Clients", "/clients"], ["Projects", "/projects"], ["Finance", "/finance"], ["Meetings", "/meetings"], ["Follow-ups", "/follow-ups"], ["Infrastructure", "/infrastructure"], ["Demo environments", "/infrastructure/demos"], ["Search", "/workspace/search"],
];
type WorkspaceUser = { fullName: string; role: { name: string } };
export function WorkspaceFrame({ user, children }: { user: WorkspaceUser; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const current = navigation.find(([, href]) => href === pathname)?.[0] ?? "Workspace";
  return <div className="workspace">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="sidebar" onKeyDown={(event) => { if (event.key === "Escape" && open) { setOpen(false); menuRef.current?.focus(); } }}>
      <div className="brand-row"><Link className="brand" href="/dashboard" aria-label="TattvaTech workspace"><div className="wordmark">Tattva<span>Tech</span></div><p className="eyebrow">Company workspace</p></Link><button ref={menuRef} className="button button-secondary mobile-menu" aria-expanded={open} aria-controls="workspace-navigation" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button></div>
      <div id="workspace-navigation" className={`sidebar-content ${open ? "is-open" : ""}`}>
        <nav aria-label="Primary navigation"><p className="eyebrow nav-group">Workspace</p>{navigation.map(([label, href], index) => <Link key={href} className="nav-item" href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}><span className="mono" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{label}</Link>)}</nav>
        <div className="account"><div className="account-details"><p className="record-title">{user.fullName}</p><p className="record-meta">{user.role.name}</p></div><LogoutButton /></div>
      </div>
    </aside>
    <div className="workspace-content"><header className="topbar"><p className="eyebrow">Workspace <span aria-hidden="true">/</span> {current}</p><Link href="/workspace/search" className="mono">Search <span aria-hidden="true">↗</span></Link></header><main className="workspace-main" id="main-content" tabIndex={-1}>{children}<footer className="workspace-footer"><span>TattvaTech / Internal workspace</span><span>Engineered with purpose.</span></footer></main></div>
  </div>;
}
