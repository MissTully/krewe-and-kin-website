import type { Metadata } from "next";
import { DirectoryBoard } from "@/components/DirectoryBoard";
import { SiteHeader } from "@/components/SiteHeader";
import { LISTING_REQUEST_MAILTO } from "@/lib/directory";
import "./directory.css";

const title = "Krewe Business Directory — Krewe & Kin";
const description =
  "Hire krewe. A public directory of Tampa Bay businesses owned by krewe members — websites, apps, print, photo, food, and entertainment.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "https://kreweandkin.com/directory" },
  openGraph: {
    title,
    description:
      "Hire krewe. Keep the work in the family. Local companies owned by Tampa Bay krewe members, in one list.",
    type: "website",
    url: "https://kreweandkin.com/directory",
    siteName: "Krewe & Kin",
  },
};

export default function DirectoryPage() {
  return (
    <div className="kk-page">
      <a className="kk-skip" href="#directory-main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="directory-main" className="kk-wrap">
        <header className="kk-hero">
          <p className="kk-eyebrow">Krewe Business Directory</p>
          <h1>
            Hire <em>krewe</em>. Keep the work in the family.
          </h1>
          <p className="kk-lede">
            Gasparilla boards already want to spend with local companies owned by
            krewe members. This is the list:{" "}
            <strong>
              websites, apps, print, photo, food, and the people who make parade
              season run
            </strong>{" "}
            — all owned by someone who rides with a krewe.
          </p>
        </header>

        <DirectoryBoard />

        <section className="kk-cta" aria-labelledby="listing-request-heading">
          <div>
            <h2 id="listing-request-heading">
              Own a business and ride with a krewe?
            </h2>
            <p>
              Send your name, krewe, what you offer, and a contact. We’ll add you
              once we confirm you’re krewe-owned and Tampa Bay local.
            </p>
          </div>
          <a className="kk-btn" href={LISTING_REQUEST_MAILTO}>
            Request a listing <span aria-hidden="true">→</span>
          </a>
        </section>
      </main>
      <footer className="kk-foot">
        <p>
          Krewe &amp; Kin ·{" "}
          <a href="mailto:missy@kreweandkin.com">missy@kreweandkin.com</a>
          {" · "}
          <a href="tel:+18134161641">(813) 416-1641</a>
        </p>
        <p>Tampa Bay · member-owned businesses</p>
      </footer>
    </div>
  );
}
