import { Nav } from "@/components/Nav";
import { getSessionUser } from "@/lib/auth";

export default async function ClientsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <>
      <Nav user={user} />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</div>
      <footer className="border-t border-stone-200 bg-[#F5F0E6] py-6 text-center text-sm text-stone-600">
        Krewe &amp; Kin · missy@kreweandkin.com ·{" "}
        <a className="underline hover:text-[#C9A227]" href="/">
          kreweandkin.com
        </a>
      </footer>
    </>
  );
}
