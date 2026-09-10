import { statusLabel } from "@/lib/format";

const styles: Record<string, string> = {
  draft: "bg-stone-200 text-stone-800",
  sent: "bg-amber-100 text-amber-900",
  partial: "bg-sky-100 text-sky-900",
  paid: "bg-emerald-100 text-emerald-900",
  overdue: "bg-rose-100 text-rose-900",
  void: "bg-stone-300 text-stone-700",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status] || styles.draft}`}
    >
      {statusLabel(status)}
    </span>
  );
}
