import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DirectoryReviewList } from "@/components/DirectoryReviewList";
import { SiteHeader } from "@/components/SiteHeader";
import { getSessionUser } from "@/lib/auth";
import { listSubmissions } from "@/lib/directory-submissions";
import "../directory.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Review directory listings — Krewe & Kin" },
  robots: { index: false, follow: false },
};

export default async function DirectoryReviewPage() {
  const user = await getSessionUser();
  if (!user) redirect("/clients/login");
  if (user.profile.role !== "admin") redirect("/clients/dashboard");

  let submissions: Awaited<ReturnType<typeof listSubmissions>> = [];
  let loadError = false;
  try {
    submissions = await listSubmissions();
  } catch (error) {
    console.error("directory review load failed", error);
    loadError = true;
  }

  const pending = submissions.filter((submission) => submission.status === "pending").length;

  return (
    <div className="kk-page">
      <a className="kk-skip" href="#review-main">
        Skip to content
      </a>
      <SiteHeader />
      <main id="review-main" className="kk-wrap kk-request">
        <header className="kk-hero">
          <p className="kk-eyebrow">Krewe Business Directory</p>
          <h1>Review listings</h1>
          <p className="kk-lede">
            {pending === 0
              ? "Nothing is waiting. New requests from the listing form land here first."
              : pending === 1
                ? "1 request is waiting. Approve it and the uploaded image goes on the public card."
                : `${pending} requests are waiting. Approve one and the uploaded image goes on the public card.`}
          </p>
        </header>
        {loadError ? (
          <p className="kk-form__banner" role="alert">
            The listing store didn’t load. Check the Blob token and try again.
          </p>
        ) : (
          <DirectoryReviewList
            submissions={submissions.map((submission) => {
              const visible = { ...submission };
              delete visible.flyerToken;
              return visible;
            })}
          />
        )}
      </main>
    </div>
  );
}
