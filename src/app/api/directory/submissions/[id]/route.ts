import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { setSubmissionStatus, type SubmissionStatus } from "@/lib/directory-submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUSES = new Set<SubmissionStatus>(["pending", "approved", "rejected"]);

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getSessionUser();
  if (!user || user.profile.role !== "admin") {
    return NextResponse.json({ error: "Sign in as an admin to review listings." }, { status: 403 });
  }

  const { id } = await context.params;
  let status: SubmissionStatus | null = null;
  try {
    const body = (await request.json()) as { status?: string };
    if (body.status && STATUSES.has(body.status as SubmissionStatus)) {
      status = body.status as SubmissionStatus;
    }
  } catch {
    status = null;
  }

  if (!status) {
    return NextResponse.json({ error: "Choose approve or reject." }, { status: 400 });
  }

  try {
    const updated = await setSubmissionStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: "That listing isn’t here." }, { status: 404 });
    }
    revalidatePath("/directory");
    revalidatePath("/directory/review");
    return NextResponse.json({ ok: true, status: updated.status });
  } catch (error) {
    console.error("directory review failed", error);
    return NextResponse.json({ error: "Couldn’t update that listing." }, { status: 400 });
  }
}
