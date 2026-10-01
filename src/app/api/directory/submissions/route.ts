import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import {
  createSubmission,
  validateSubmissionFields,
  validateSubmissionImage,
  type SubmissionErrors,
} from "@/lib/directory-submissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { errors: { form: "That upload didn’t come through. Try a smaller image." } satisfies SubmissionErrors },
      { status: 400 },
    );
  }

  if (field(formData, "company")) {
    return NextResponse.json({ ok: true });
  }

  const input = {
    name: field(formData, "name"),
    krewe: field(formData, "krewe"),
    categoryId: field(formData, "category"),
    offer: field(formData, "offer"),
    contact: field(formData, "contact"),
    website: field(formData, "website"),
  };
  const errors = validateSubmissionFields(input);

  const file = formData.get("image");
  let bytes = new Uint8Array();
  if (!(file instanceof File) || file.size === 0) {
    errors.image = "Add a logo or photo (JPG, PNG, or WebP, up to 4 MB).";
  } else {
    bytes = new Uint8Array(await file.arrayBuffer());
    const image = validateSubmissionImage(bytes);
    if (!image.kind) {
      errors.image = image.error;
    } else if (Object.keys(errors).length === 0) {
      try {
        const submission = await createSubmission({ ...input, bytes, kind: image.kind });
        revalidatePath("/directory");
        revalidatePath("/directory/review");
        return NextResponse.json({
          ok: true,
          id: submission.id,
          flyerToken: submission.flyerToken,
        });
      } catch (error) {
        console.error("directory submission failed", error);
        return NextResponse.json(
          {
            errors: {
              form: "We couldn’t save that upload. Try again in a minute, or email missy@kreweandkin.com.",
            } satisfies SubmissionErrors,
          },
          { status: 503 },
        );
      }
    }
  }

  return NextResponse.json({ errors }, { status: 400 });
}
