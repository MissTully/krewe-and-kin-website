import Link from "next/link";
import { listClients } from "@/lib/data";
import { CreateInvoiceForm } from "./CreateInvoiceForm";

export default async function NewInvoicePage() {
  const clients = await listClients();
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/clients/admin" className="text-sm text-stone-500 hover:text-[#C9A227]">
          ← Admin
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Create invoice</h1>
        <p className="text-sm text-stone-600">
          One-time, deposit + balance pair, or monthly retainer.
        </p>
      </div>
      <CreateInvoiceForm
        clients={clients.map((c) => ({
          id: c.id,
          label: `${c.company_name} (${c.contact_name})`,
        }))}
      />
    </div>
  );
}
