import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-data";
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>;
}) {
  const user = await getSessionUser();
  const params = await searchParams;
  if (user && !isDemoMode()) {
    redirect(user.profile.role === "admin" ? "/clients/admin" : "/clients/dashboard");
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-stone-600">
          Magic link via Supabase Auth{isDemoMode() ? " · demo mode available" : ""}.
        </p>
      </div>
      {params.error ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {params.error}
        </p>
      ) : null}
      {params.message ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {params.message}
        </p>
      ) : null}
      <LoginForm demoMode={isDemoMode()} />
    </div>
  );
}
