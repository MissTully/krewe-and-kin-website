import Link from "next/link";
import type { SessionUser } from "@/lib/auth";

export function Nav({ user }: { user: SessionUser | null }) {
  const isAdmin = user?.profile.role === "admin";
  return (
    <header className="border-b border-[#C9A227]/40 bg-[#0a0a0a] text-[#F5F0E6]">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
        <Link href={user ? "/clients/dashboard" : "/"} className="group">
          <div className="text-lg font-semibold tracking-wide">
            Krewe <span className="text-[#C9A227]">&amp;</span> Kin
          </div>
          <div className="text-xs text-[#F5F0E6]/70">Client billing</div>
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {user ? (
            <>
              <Link className="hover:text-[#C9A227]" href="/clients/dashboard">
                Dashboard
              </Link>
              {isAdmin ? (
                <>
                  <Link className="hover:text-[#C9A227]" href="/clients/admin">
                    Admin
                  </Link>
                  <Link className="hover:text-[#C9A227]" href="/clients/admin/clients">
                    Clients
                  </Link>
                  <Link className="hover:text-[#C9A227]" href="/clients/admin/invoices/new">
                    New invoice
                  </Link>
                </>
              ) : null}
              <span className="hidden text-[#F5F0E6]/50 sm:inline">|</span>
              <span className="text-[#F5F0E6]/80">
                {user.profile.full_name || user.email}
                {isAdmin ? " · admin" : ""}
              </span>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="rounded border border-[#C9A227]/50 px-2 py-1 text-xs hover:bg-[#C9A227]/10"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/clients/login"
              className="rounded bg-[#C9A227] px-3 py-1.5 font-medium text-[#0a0a0a] hover:bg-[#e0b93a]"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
