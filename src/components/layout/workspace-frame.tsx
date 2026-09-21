"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";

const navigation = [
  ["Overview", "/dashboard"], ["Leads", "/leads"], ["Clients", "/clients"], ["Projects", "/projects"], ["Meetings", "/meetings"], ["Follow-ups", "/follow-ups"], ["Infrastructure", "/infrastructure"],
];
type WorkspaceUser = { fullName: string; role: { name: string }; roles: string[]; department: string | null; financeAccess: boolean };
export function WorkspaceFrame({ user, children }: { user: WorkspaceUser; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [financeOpen, setFinanceOpen] = useState(pathname.startsWith("/finance"));
  const menuRef = useRef<HTMLButtonElement>(null);
  const current = navigation.find(([, href]) => href === pathname)?.[0] ?? "Workspace";
  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
    };
    update(); window.addEventListener("scroll", update, { passive: true }); window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [pathname]);
  useEffect(() => { if (pathname.startsWith("/finance")) setFinanceOpen(true); }, [pathname]);
  return <div className="workspace">
    <div className="scroll-progress gradient-sunset" style={{ width: `${progress}%` }} aria-hidden="true" />
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="sidebar" onKeyDown={(event) => { if (event.key === "Escape" && open) { setOpen(false); menuRef.current?.focus(); } }}>
      <div className="brand-row"><Link className="brand" href="/dashboard" aria-label="TattvaTech workspace"><img className="brand-logo" src="/Logo.png" alt="TattvaTech" /><p className="eyebrow">Company workspace</p></Link><button ref={menuRef} className="button button-secondary mobile-menu" aria-expanded={open} aria-controls="workspace-navigation" onClick={() => setOpen(!open)}>{open ? "Close" : "Menu"}</button></div>
      <div id="workspace-navigation" className={`sidebar-content ${open ? "is-open" : ""}`}>
        <nav aria-label="Primary navigation"><p className="eyebrow nav-group">Workspace</p>{navigation.map(([label, href], index) => <Link key={href} className="nav-item" href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}><span className="mono" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{label}</Link>)}{user.financeAccess && <div className="nav-group-wrap"><Link className={`nav-item ${pathname.startsWith("/finance") ? "is-active" : ""}`} href="/finance" aria-current={pathname === "/finance" ? "page" : undefined} aria-expanded={financeOpen} onClick={() => { setFinanceOpen(true); setOpen(false); }}><span className="mono" aria-hidden="true">05</span><span className="nav-chevron" aria-hidden="true">{financeOpen ? "▾" : "▸"}</span>Finance</Link>{financeOpen && <div className="nav-children"><Link className="nav-child" href="/finance/invoices" aria-current={pathname === "/finance/invoices" ? "page" : undefined} onClick={() => setOpen(false)}>Invoice Generation</Link><Link className="nav-child" href="/finance/quotations" aria-current={pathname === "/finance/quotations" ? "page" : undefined} onClick={() => setOpen(false)}>Final Quotation</Link></div>}</div>}</nav>
        <div className="account"><div className="account-details"><p className="record-title">{user.fullName}</p><p className="record-meta">{user.roles.length ? user.roles.join(" · ") : user.role.name}</p>{user.department && <p className="record-meta">{user.department}</p>}</div><LogoutButton /></div>
      </div>
    </aside>
    <div className="workspace-content"><header className="topbar"><p className="eyebrow">Workspace <span aria-hidden="true">/</span> {current}</p></header><main className="workspace-main" id="main-content" tabIndex={-1}>{children}<footer className="workspace-footer"><span>TattvaTech / Internal workspace</span><span>Engineered with purpose.</span></footer></main></div>
  </div>;
}
