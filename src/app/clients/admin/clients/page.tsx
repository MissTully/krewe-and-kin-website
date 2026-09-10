import Link from "next/link";
import { listClients } from "@/lib/data";

export default async function AdminClientsPage() {
  const clients = await listClients();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Clients</h1>
          <p className="text-sm text-stone-600">Studio client accounts.</p>
        </div>
        <Link
          href="/clients/admin/clients/new"
          className="rounded-md bg-[#0a0a0a] px-3 py-2 text-sm font-medium text-[#F5F0E6] hover:bg-stone-800"
        >
          Add client
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-[#F5F0E6] text-xs uppercase tracking-wide text-stone-600">
            <tr>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium">{c.company_name}</td>
                <td className="px-4 py-3">{c.contact_name}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">{c.phone || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
