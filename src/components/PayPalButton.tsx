"use client";

import { useState } from "react";

export function PayPalButton({
  invoiceId,
  disabled,
}: {
  invoiceId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function pay() {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const createRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });
      const createData = await createRes.json();
      if (!createRes.ok) {
        throw new Error(createData.error || "Could not create PayPal order");
      }

      if (createData.demo) {
        const captureRes = await fetch("/api/paypal/capture-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: createData.id,
            invoiceId,
          }),
        });
        const captureData = await captureRes.json();
        if (!captureRes.ok) {
          throw new Error(captureData.error || "Capture failed");
        }
        setMessage("Demo payment captured. Invoice marked paid.");
        window.location.reload();
        return;
      }

      if (createData.approveUrl) {
        window.location.href = createData.approveUrl;
        return;
      }

      throw new Error("No PayPal approval URL returned");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={pay}
        className="inline-flex items-center justify-center rounded-md bg-[#0070ba] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#005ea6] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Connecting to PayPal…" : "Pay with PayPal"}
      </button>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      <p className="text-xs text-stone-500">
        Uses PayPal Orders API (sandbox when PAYPAL_* env is set; demo capture otherwise).
      </p>
    </div>
  );
}
