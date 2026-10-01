import type { Metadata } from "next";
import { RequestListingForm } from "@/components/RequestListingForm";
import { SiteHeader } from "@/components/SiteHeader";
import "../directory.css";

const title = "Request a listing — Krewe Business Directory";
const description =
  "Krewe members can request a Tampa Bay business listing, upload a logo for the card, and optionally add a marketing flyer. Missy approves it before it goes on the directory.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "https://kreweandkin.com/directory/request" },
  openGraph: {
    title,
    description,
    type: "website",
    url: "https://kreweandkin.com/directory/request",
    siteName: "Krewe & Kin",
  },
};

export default function RequestListingPage() {
  return (
    <div className="kk-page">
      <a className="kk-skip" href="#request-main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="request-main" className="kk-wrap kk-request">
        <header className="kk-hero">
          <p className="kk-eyebrow">Krewe Business Directory</p>
          <h1>Request a listing</h1>
          <p className="kk-lede">
            Tell us the business, your krewe, what you offer, and an email
            and phone so boards can reach you. The logo or photo is the
            directory card. A marketing flyer is optional and opens from the
            listing after it’s approved.
          </p>
        </header>
        <RequestListingForm />
        <p className="kk-request__note">
          <a href="/directory">Back to the directory</a>
        </p>
      </main>
    </div>
  );
}
