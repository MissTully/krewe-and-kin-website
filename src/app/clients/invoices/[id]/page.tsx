import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PayPalButton } from "@/components/PayPalButton";
import { StatusBadge } from "@/components/StatusBadge";
import { getSessionUser } from "@/lib/auth";
import { getInvoiceById } from "@/lib/data";
import { formatDate, formatMoney, typeLabel } from "@/lib/format";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/clients/login");

  const { id } = await params;
  const invoice = await getInvoiceById(id);
  if (!invoice) notFound();

  const balance = Math.max(0, invoice.total_cents - invoice.amount_paid_cents);
  const payable = balance > 0 && !["paid", "void", "draft"].includes(invoice.status);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/clients/dashboard" className="text-sm text-stone-500 hover:text-[#C9A227]">
          ← Back to dashboard
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{invoice.invoice_number}</h1>
            <p className="text-stone-600">{invoice.title}</p>
          </div>
          <StatusBadge status={invoice.status} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
            <dl className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-stone-500">Client</dt>
                <dd className="font-medium">
                  {invoice.client?.company_name}
                  <div className="text-stone-600">{invoice.client?.contact_name}</div>
                </dd>
              </div>
              <div>
                <dt className="text-stone-500">Type</dt>
                <dd className="font-medium">{typeLabel(invoice.invoice_type)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Issued</dt>
                <dd className="font-medium">{formatDate(invoice.issued_at)}</dd>
              </div>
              <div>
                <dt className="text-stone-500">Due</dt>
                <dd className="font-medium">{formatDate(invoice.due_date)}</dd>
              </div>
            </dl>
            {invoice.description ? (
              <p className="mt-4 border-t border-stone-100 pt-4 text-sm text-stone-600">
                {invoice.description}
              </p>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F5F0E6] text-left text-xs uppercase tracking-wide text-stone-600">
                <tr>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">Unit</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.line_items || []).map((item) => (
                  <tr key={item.id} className="border-t border-stone-100">
                    <td className="px-4 py-3">{item.description}</td>
                    <td className="px-4 py-3 text-right">{item.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      {formatMoney(item.unit_amount_cents, invoice.currency)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatMoney(item.amount_cents, invoice.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-[#C9A227]/40 bg-white p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wide text-stone-500">Total</div>
            <div className="mt-1 text-2xl font-semibold">
              {formatMoney(invoice.total_cents, invoice.currency)}
            </div>
            <div className="mt-3 flex justify-between text-sm">
              <span className="text-stone-500">Paid</span>
              <span>{formatMoney(invoice.amount_paid_cents, invoice.currency)}</span>
            </div>
            <div className="mt-1 flex justify-between text-sm font-semibold">
              <span>Balance due</span>
              <span>{formatMoney(balance, invoice.currency)}</span>
            </div>
            <div className="mt-5 space-y-3">
              {payable ? <PayPalButton invoiceId={invoice.id} /> : null}
              <a
                href={`/clients/invoices/${invoice.id}/pdf`}
                className="inline-flex w-full items-center justify-center rounded-md border border-stone-300 px-4 py-2.5 text-sm font-medium hover:bg-stone-50"
              >
                Download PDF
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
