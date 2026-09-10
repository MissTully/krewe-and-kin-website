import Link from "next/link";
import { CreateClientForm } from "./CreateClientForm";

export default function NewClientPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/clients/admin/clients" className="text-sm text-stone-500 hover:text-[#C9A227]">
          ← Clients
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Add client</h1>
      </div>
      <CreateClientForm />
    </div>
  );
}
