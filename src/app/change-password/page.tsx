import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default async function ChangePasswordPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.forcePasswordChange) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-brand-600">TattvaTech</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">Change your password</h1>
          <p className="mt-2 text-sm text-slate">
            This is your first time signing in. Please set a new password to continue.
          </p>
        </div>
        <ChangePasswordForm />
      </section>
    </main>
  );
}
