import Link from "next/link";
import { redirect } from "next/navigation";
import { InvoiceTable } from "@/components/InvoiceTable";
import { getSessionUser } from "@/lib/auth";
import { listInvoicesForCurrentUser } from "@/lib/data";
import { formatMoney } from "@/lib/format";

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/clients/login");

  const invoices = await listInvoicesForCurrentUser();
  const open = invoices.filter((i) => !["paid", "void"].includes(i.status));
  const dueCents = open.reduce(
    (sum, i) => sum + Math.max(0, i.total_cents - i.amount_paid_cents),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Your invoices</h1>
          <p className="text-sm text-stone-600">
            Welcome back{user.profile.full_name ? `, ${user.profile.full_name}` : ""}.
          </p>
        </div>
        {user.profile.role === "admin" ? (
          <Link
            href="/clients/admin"
            className="text-sm font-medium text-[#C9A227] hover:underline"
          >
            Open admin board →
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-stone-500">Open</div>
          <div className="mt-1 text-2xl font-semibold">{open.length}</div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-stone-500">
            Balance due
          </div>
          <div className="mt-1 text-2xl font-semibold">{formatMoney(dueCents)}</div>
        </div>
        <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="text-xs uppercase tracking-wide text-stone-500">Total</div>
          <div className="mt-1 text-2xl font-semibold">{invoices.length}</div>
        </div>
      </div>

      <InvoiceTable invoices={invoices} />
    </div>
  );
}
