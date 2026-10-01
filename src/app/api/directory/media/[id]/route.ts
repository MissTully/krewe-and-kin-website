import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getSubmission, readLocalSubmissionImage } from "@/lib/directory-submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return new NextResponse("Not found", { status: 404 });
  }

  let submission;
  try {
    submission = await getSubmission(id);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
  if (!submission) return new NextResponse("Not found", { status: 404 });

  if (submission.status !== "approved") {
    const user = await getSessionUser();
    if (!user || user.profile.role !== "admin") {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  if (submission.imageUrl.startsWith("https://")) {
    return NextResponse.redirect(submission.imageUrl);
  }

  const bytes = await readLocalSubmissionImage(id);
  if (!bytes) return new NextResponse("Not found", { status: 404 });

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": submission.imageContentType,
      "Cache-Control":
        submission.status === "approved" ? "public, max-age=86400" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
