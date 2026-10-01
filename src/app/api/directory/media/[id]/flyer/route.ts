import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getSubmission, readLocalFlyer } from "@/lib/directory-submissions";

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
  if (!submission?.flyerUrl || !submission.flyerContentType) {
    return new NextResponse("Not found", { status: 404 });
  }

  if (submission.status !== "approved") {
    const user = await getSessionUser();
    if (!user || user.profile.role !== "admin") {
      return new NextResponse("Not found", { status: 404 });
    }
  }

  if (submission.flyerUrl.startsWith("https://")) {
    return NextResponse.redirect(submission.flyerUrl);
  }

  const bytes = await readLocalFlyer(id);
  if (!bytes) return new NextResponse("Not found", { status: 404 });

  const filename = submission.flyerExt === "pdf" ? "flyer.pdf" : `flyer.${submission.flyerExt}`;
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": submission.flyerContentType,
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control":
        submission.status === "approved" ? "public, max-age=86400" : "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
