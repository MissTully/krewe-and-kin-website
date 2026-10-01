"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DirectorySubmission } from "@/lib/directory-submissions";
import { DIRECTORY_CATEGORIES } from "@/lib/directory";

export function DirectoryReviewList({ submissions }: { submissions: DirectorySubmission[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function update(id: string, status: "approved" | "rejected" | "pending") {
    setPendingId(id);
    setError(null);
    try {
      const response = await fetch(`/api/directory/submissions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Couldn’t update that listing.");
        return;
      }
      router.refresh();
    } catch {
      setError("Couldn’t update that listing.");
    } finally {
      setPendingId(null);
    }
  }

  if (submissions.length === 0) {
    return <p className="kk-review__empty">No listing requests yet.</p>;
  }

  const groups: Array<{ status: DirectorySubmission["status"]; title: string }> = [
    { status: "pending", title: "Waiting for review" },
    { status: "approved", title: "On the directory" },
    { status: "rejected", title: "Not listed" },
  ];

  return (
    <div className="kk-review">
      {error ? (
        <p className="kk-form__banner" role="alert">
          {error}
        </p>
      ) : null}
      {groups.map((group) => {
        const rows = submissions.filter((submission) => submission.status === group.status);
        if (rows.length === 0) return null;
        return (
          <section key={group.status} className="kk-review__group" aria-labelledby={`${group.status}-heading`}>
            <h2 id={`${group.status}-heading`}>{group.title}</h2>
            <ul>
              {rows.map((submission) => {
                const category = DIRECTORY_CATEGORIES.find(
                  (item) => item.id === submission.categoryId,
                );
                const busy = pendingId === submission.id;
                return (
                  <li key={submission.id} className="kk-review__item">
                    <div className="kk-form__preview">
                      {/* Admin-only preview. Pending images 404 for everyone else. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={submission.imageUrl} alt={submission.imageAlt} />
                    </div>
                    <div>
                      <h3>{submission.name}</h3>
                      <p>
                        {submission.krewe} · {category?.label ?? submission.categoryId}
                      </p>
                      <p>{submission.offer}</p>
                      <p>{submission.contact}</p>
                      {submission.website ? <p>{submission.website}</p> : null}
                      <div className="kk-review__actions">
                        {submission.status !== "approved" ? (
                          <button
                            type="button"
                            className="kk-btn"
                            disabled={busy}
                            onClick={() => update(submission.id, "approved")}
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="kk-btn kk-btn--ghost"
                            disabled={busy}
                            onClick={() => update(submission.id, "rejected")}
                          >
                            Remove from directory
                          </button>
                        )}
                        {submission.status === "pending" ? (
                          <button
                            type="button"
                            className="kk-btn kk-btn--ghost"
                            disabled={busy}
                            onClick={() => update(submission.id, "rejected")}
                          >
                            Reject
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
