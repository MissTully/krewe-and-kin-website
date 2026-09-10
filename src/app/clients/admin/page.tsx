import Link from "next/link";
import { InvoiceTable } from "@/components/InvoiceTable";
import { StatusBadge } from "@/components/StatusBadge";
import { listInvoicesForCurrentUser, listSchedules } from "@/lib/data";
import { formatDate, formatMoney } from "@/lib/format";

export default async function AdminStatusBoardPage() {
  const invoices = await listInvoicesForCurrentUser();
  const schedules = await listSchedules();

  const byStatus = invoices.reduce<Record<string, number>>((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin status board</h1>
          <p className="text-sm text-stone-600">
            Track deposits, balances, and retainers across clients.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/clients/admin/clients"
            className="rounded-md border border-stone-300 bg-white px-3 py-2 text-sm hover:bg-stone-50"
          >
            Clients
          </Link>
          <Link
            href="/clients/admin/invoices/new"
            className="rounded-md bg-[#C9A227] px-3 py-2 text-sm font-medium text-[#0a0a0a] hover:bg-[#e0b93a]"
          >
            Create invoice
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {["draft", "sent", "partial", "paid", "overdue", "void"].map((status) => (
          <div
            key={status}
            className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
          >
            <StatusBadge status={status} />
            <div className="mt-2 text-2xl font-semibold">{byStatus[status] || 0}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">All invoices</h2>
        <InvoiceTable invoices={invoices} />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Active payment schedules</h2>
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b bg-[#F5F0E6] text-xs uppercase tracking-wide text-stone-600">
              <tr>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Next due</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-b border-stone-100">
                  <td className="px-4 py-3">{s.label}</td>
                  <td className="px-4 py-3 capitalize">
                    {s.schedule_type.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3">{formatMoney(s.amount_cents)}</td>
                  <td className="px-4 py-3">{formatDate(s.next_due_date)}</td>
                </tr>
              ))}
              {!schedules.length ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-stone-500">
                    No active schedules
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
