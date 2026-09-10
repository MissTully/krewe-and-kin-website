export function formatMoney(cents: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
}

export function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

export function typeLabel(type: string): string {
  const map: Record<string, string> = {
    one_time: "One-time",
    deposit: "Deposit",
    balance: "Balance",
    retainer: "Retainer",
  };
  return map[type] ?? type;
}
