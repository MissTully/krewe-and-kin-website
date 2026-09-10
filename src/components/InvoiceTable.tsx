import Link from "next/link";
import type { Invoice } from "@/lib/types";
import { formatDate, formatMoney, typeLabel } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  if (!invoices.length) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 bg-white p-8 text-center text-stone-500">
        No invoices yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-stone-200 bg-[#F5F0E6] text-xs uppercase tracking-wide text-stone-600">
          <tr>
            <th className="px-4 py-3">Invoice</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Due</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-stone-100 hover:bg-stone-50">
              <td className="px-4 py-3">
                <Link
                  href={`/clients/invoices/${inv.id}`}
                  className="font-medium text-[#0a0a0a] underline-offset-2 hover:text-[#C9A227] hover:underline"
                >
                  {inv.invoice_number}
                </Link>
                <div className="text-xs text-stone-500">{inv.title}</div>
              </td>
              <td className="px-4 py-3">{inv.client?.company_name || "—"}</td>
              <td className="px-4 py-3">{typeLabel(inv.invoice_type)}</td>
              <td className="px-4 py-3">{formatDate(inv.due_date)}</td>
              <td className="px-4 py-3 font-medium">
                {formatMoney(inv.total_cents, inv.currency)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={inv.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
