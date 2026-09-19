"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50" onClick={logout}>Sign out</button>;
}
