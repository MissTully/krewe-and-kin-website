"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Mode = "one_time" | "deposit_balance" | "retainer";

export function CreateInvoiceForm({
  clients,
}: {
  clients: Array<{ id: string; label: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("one_time");
  const [clientId, setClientId] = useState(clients[0]?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amountDollars, setAmountDollars] = useState("2500");
  const [depositPercent, setDepositPercent] = useState("50");
  const [dueDate, setDueDate] = useState("");
  const [lineDescription, setLineDescription] = useState("Professional services");

  const hint = useMemo(() => {
    const total = Math.round(parseFloat(amountDollars || "0") * 100);
    if (mode === "deposit_balance") {
      const pct = Math.min(90, Math.max(10, parseInt(depositPercent || "50", 10)));
      const deposit = Math.round((total * pct) / 100);
      return `Creates deposit (${(deposit / 100).toFixed(2)}) + balance (${(
        (total - deposit) /
        100
      ).toFixed(2)}) invoices and a schedule.`;
    }
    if (mode === "retainer") {
      return "Creates a retainer invoice and an active monthly schedule.";
    }
    return "Creates a single one-time invoice.";
  }, [mode, amountDollars, depositPercent]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/clients/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          client_id: clientId,
          title,
          description,
          amount_cents: Math.round(parseFloat(amountDollars) * 100),
          deposit_percent: parseInt(depositPercent, 10),
          due_date: dueDate || null,
          line_description: lineDescription,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create invoice");
      router.push(data.redirectTo || "/clients/admin");
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
      <label className="block text-sm font-medium">
        Client
        <select
          required
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
        >
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Invoice mode</legend>
        {(
          [
            ["one_time", "One-time"],
            ["deposit_balance", "Deposit + balance"],
            ["retainer", "Retainer (monthly)"],
          ] as const
        ).map(([value, label]) => (
          <label key={value} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="mode"
              checked={mode === value}
              onChange={() => setMode(value)}
            />
            {label}
          </label>
        ))}
        <p className="text-xs text-stone-500">{hint}</p>
      </fieldset>

      <label className="block text-sm font-medium">
        Title
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
          placeholder="Website build"
        />
      </label>

      <label className="block text-sm font-medium">
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
        />
      </label>

      <label className="block text-sm font-medium">
        Line item description
        <input
          required
          value={lineDescription}
          onChange={(e) => setLineDescription(e.target.value)}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium">
          Amount (USD)
          <input
            required
            type="number"
            min="1"
            step="0.01"
            value={amountDollars}
            onChange={(e) => setAmountDollars(e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
          />
        </label>
        {mode === "deposit_balance" ? (
          <label className="block text-sm font-medium">
            Deposit %
            <input
              type="number"
              min="10"
              max="90"
              value={depositPercent}
              onChange={(e) => setDepositPercent(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
            />
          </label>
        ) : (
          <label className="block text-sm font-medium">
            Due date
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2"
            />
          </label>
        )}
      </div>

      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <button
        type="submit"
        disabled={loading || !clientId}
        className="w-full rounded-md bg-[#C9A227] px-4 py-2.5 text-sm font-semibold text-[#0a0a0a] disabled:opacity-50"
      >
        {loading ? "Creating…" : "Create"}
      </button>
    </form>
  );
}
