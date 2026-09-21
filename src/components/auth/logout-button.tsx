"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Notice } from "@/components/ui/primitives";
export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function logout() {
    setPending(true); setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sign out failed. Please try again.");
      router.push("/login"); router.refresh();
    } catch { setError("Sign out failed. Please try again."); setPending(false); }
  }
  return <>{error && <Notice>{error}</Notice>}<Button variant="secondary" onClick={logout} disabled={pending}>{pending ? "Signing out…" : "Sign out ↗"}</Button></>;
}
