"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function CreateClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    notes: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create client");
      router.push("/clients/admin/clients");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border border-stone-200 bg-white p-6 shadow-sm"
    >
      {(
        [
          ["company_name", "Company name"],
          ["contact_name", "Contact name"],
          ["email", "Email"],
          ["phone", "Phone"],
        ] as const
      ).map(([key, label]) => (
        <label key={key} className="block text-sm font-medium">
          {label}
          <input
            required={key !== "phone"}
            type={key === "email" ? "email" : "text"}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-[#C9A227]"
          />
        </label>
      ))}
      <label className="block text-sm font-medium">
        Notes
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={3}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 outline-none focus:border-[#C9A227]"
        />
      </label>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-[#0a0a0a] px-4 py-2.5 text-sm font-medium text-[#F5F0E6] disabled:opacity-50"
      >
        {loading ? "Saving…" : "Create client"}
      </button>
    </form>
  );
}
