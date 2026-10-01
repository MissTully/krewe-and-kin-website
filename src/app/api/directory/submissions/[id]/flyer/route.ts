import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  attachFlyer,
  deleteSubmission,
  getSubmission,
  validateFlyer,
  type SubmissionErrors,
} from "@/lib/directory-submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function flyerTokenMatches(id: string, token: string) {
  try {
    const submission = await getSubmission(id);
    return Boolean(
      submission && submission.status === "pending" && submission.flyerToken === token,
    );
  } catch {
    return false;
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { errors: { flyer: "That flyer didn’t come through. Try a smaller file." } satisfies SubmissionErrors },
      { status: 400 },
    );
  }

  const token = formData.get("token");
  const file = formData.get("flyer");
  if (typeof token !== "string" || !(file instanceof File) || file.size === 0) {
    return NextResponse.json(
      { errors: { flyer: "Add a JPG, PNG, WebP, or PDF flyer." } satisfies SubmissionErrors },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const flyer = validateFlyer(bytes);
  const owned = await flyerTokenMatches(id, token);
  if (!flyer.kind) {
    if (owned) await deleteSubmission(id).catch(() => undefined);
    return NextResponse.json(
      { errors: { flyer: flyer.error } satisfies SubmissionErrors },
      { status: 400 },
    );
  }
  if (!owned) {
    return NextResponse.json(
      { errors: { flyer: "That flyer couldn’t be attached to the request." } satisfies SubmissionErrors },
      { status: 400 },
    );
  }

  try {
    const updated = await attachFlyer(id, token, bytes, flyer.kind);
    if (!updated) {
      return NextResponse.json(
        { errors: { flyer: "That flyer couldn’t be attached to the request." } satisfies SubmissionErrors },
        { status: 400 },
      );
    }
    revalidatePath("/directory");
    revalidatePath("/directory/review");
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("directory flyer upload failed", error);
    await deleteSubmission(id).catch(() => undefined);
    return NextResponse.json(
      {
        errors: {
          flyer: "The flyer didn’t save. Try again, or email it to missy@kreweandkin.com.",
        } satisfies SubmissionErrors,
      },
      { status: 503 },
    );
  }
}
