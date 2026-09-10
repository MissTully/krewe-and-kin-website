"use client";

import { useState } from "react";

export function LoginForm({ demoMode }: { demoMode: boolean }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send link");
      setInfo(data.message || "Check your email for a magic link.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function demoLogin(role: "client" | "admin") {
    setLoading(true);
    try {
      await fetch("/api/auth/demo-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      window.location.href = role === "admin" ? "/clients/admin" : "/clients/dashboard";
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <form onSubmit={sendMagicLink} className="space-y-4">
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-[#C9A227] focus:ring-1 focus:ring-[#C9A227]"
            placeholder="you@company.com"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-[#0a0a0a] px-4 py-2.5 text-sm font-medium text-[#F5F0E6] hover:bg-stone-800 disabled:opacity-50"
        >
          {loading ? "Sending…" : "Email me a magic link"}
        </button>
      </form>
      {info ? <p className="text-sm text-emerald-700">{info}</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      {demoMode ? (
        <div className="border-t border-stone-100 pt-4">
          <p className="mb-3 text-xs uppercase tracking-wide text-stone-500">
            Demo mode (no Supabase required)
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => demoLogin("client")}
              className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm hover:bg-stone-50"
            >
              Enter as client
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => demoLogin("admin")}
              className="flex-1 rounded-md border border-[#C9A227] bg-[#C9A227]/15 px-3 py-2 text-sm hover:bg-[#C9A227]/25"
            >
              Enter as admin
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
