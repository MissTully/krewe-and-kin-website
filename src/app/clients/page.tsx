import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getSessionUser();
  if (user) {
    redirect(user.profile.role === "admin" ? "/clients/admin" : "/clients/dashboard");
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[#C9A227]/40 bg-[#0a0a0a] px-8 py-12 text-[#F5F0E6] shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-[#C9A227]">
          Krewe &amp; Kin studio
        </p>
        <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">
          Client billing portal
        </h1>
        <p className="mt-4 max-w-xl text-[#F5F0E6]/80">
          View invoices, download PDFs, and pay deposits, balances, and monthly
          retainers securely with PayPal.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/clients/login"
            className="rounded-md bg-[#C9A227] px-4 py-2.5 font-medium text-[#0a0a0a] hover:bg-[#e0b93a]"
          >
            Client sign in
          </Link>
          <a
            href="mailto:missy@kreweandkin.com"
            className="rounded-md border border-[#F5F0E6]/40 px-4 py-2.5 hover:border-[#C9A227]"
          >
            Contact Missy
          </a>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["Website builds", "Deposit + balance invoices with clear milestones."],
          ["Monthly retainers", "Recurring support billed on a simple schedule."],
          ["PayPal checkout", "Sandbox-ready Orders API create & capture flow."],
        ].map(([title, body]) => (
          <div
            key={title}
            className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold text-[#0a0a0a]">{title}</h2>
            <p className="mt-2 text-sm text-stone-600">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
