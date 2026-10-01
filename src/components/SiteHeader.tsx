import Image from "next/image";
import Link from "next/link";

type NavLink = {
  href: string;
  label: string;
  keep?: boolean;
  current?: boolean;
  external?: boolean;
};

const LINKS: NavLink[] = [
  { href: "/#what", label: "What it does" },
  { href: "/#missy", label: "Why me" },
  { href: "/#cost", label: "What it costs" },
  { href: "/demo/", label: "Demo" },
  { href: "/directory", label: "Directory", keep: true, current: true },
  { href: "/clients", label: "Client portal", keep: true },
  {
    href: "https://calendar.app.google/8SNFPVVx3ZY4Q13i6",
    label: "Talk to me",
    keep: true,
    external: true,
  },
];

export function SiteHeader() {
  return (
    <header className="kk-nav">
      <div className="kk-nav__in">
        <Link href="/" className="kk-nav__mark" aria-label="Krewe and Kin — home">
          <Image
            src="/brand/nav-mark.jpg"
            alt=""
            width={320}
            height={222}
            priority
            className="kk-nav__logo"
          />
        </Link>
        <nav className="kk-nav__links" aria-label="Main">
          {LINKS.map((link) => {
            const className = link.keep ? "kk-nav__keep" : undefined;
            if (link.external) {
              return (
                <a
                  key={link.href}
                  className={className}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={link.href}
                className={className}
                href={link.href}
                aria-current={link.current ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
