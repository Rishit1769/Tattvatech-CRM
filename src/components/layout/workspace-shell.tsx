import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";

type WorkspaceUser = { fullName: string; role: { name: string } };

export function WorkspaceShell({ user, children }: { user: WorkspaceUser; children: ReactNode }) {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-slate-200 bg-white p-5 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-600">TattvaTech</p>
          <p className="mt-1 text-xs text-slate">Company Workspace</p>
        </div>
        <nav className="space-y-1 text-sm" aria-label="Primary navigation">
          <a className="block rounded-lg bg-brand-50 px-3 py-2 font-medium text-brand-700" href="/dashboard">Dashboard</a>
          <p className="px-3 pb-1 pt-6 text-[11px] font-bold uppercase tracking-wider text-slate">Coming next</p>
          {[['Leads', '/leads'], ['Clients', '/clients'], ['Projects', '/projects'], ['Finance', '/finance'], ['Infrastructure', '/infrastructure']].map(([item, href]) => <a className="block rounded-lg px-3 py-2 text-slate hover:bg-slate-50 hover:text-ink" href={href} key={item}>{item}</a>)}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 lg:px-10">
          <span className="text-sm text-slate">Dashboard</span>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-ink">{user.fullName}</p>
              <p className="text-xs text-slate">{user.role.name}</p>
            </div>
            <LogoutButton />
          </div>
        </header>
        <main className="mx-auto max-w-7xl p-6 lg:p-10">{children}</main>
      </div>
    </div>
  );
}
