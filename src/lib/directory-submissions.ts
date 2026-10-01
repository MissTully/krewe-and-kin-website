import { randomUUID } from "crypto";
import { mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import {
  DIRECTORY_CATEGORIES,
  type DirectoryListing,
  type ListingMeta,
  isDirectoryCategoryId,
} from "@/lib/directory";
import {
  MAX_FLYER_BYTES,
  MAX_LISTING_IMAGE_BYTES,
  sniffFlyer,
  sniffListingImage,
  type FlyerKind,
  type ListingImageKind,
} from "@/lib/directory-image";

export type SubmissionStatus = "pending" | "approved" | "rejected";

export type DirectorySubmission = {
  id: string;
  name: string;
  krewe: string;
  categoryId: string;
  offer: string;
  contact: string;
  website: string;
  status: SubmissionStatus;
  createdAt: string;
  imageAlt: string;
  imageContentType: ListingImageKind["contentType"];
  imageExt: ListingImageKind["ext"];
  /** Public card URL. Blob https URL, or the local media route in dev. */
  imageUrl: string;
  /** Set only until the optional flyer upload finishes. Not shown publicly. */
  flyerToken?: string;
  flyerUrl?: string;
  flyerContentType?: FlyerKind["contentType"];
  flyerExt?: FlyerKind["ext"];
};

export type SubmissionInput = {
  name: string;
  krewe: string;
  categoryId: string;
  offer: string;
  contact: string;
  website: string;
  bytes: Uint8Array;
  kind: ListingImageKind;
};

const PREFIX = "directory-submissions";

function blobEnabled() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function localDir() {
  return path.join(process.cwd(), ".data", PREFIX);
}

function assertId(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error("Invalid submission id");
  }
}

function isSubmission(value: unknown): value is DirectorySubmission {
  if (!value || typeof value !== "object") return false;
  const row = value as DirectorySubmission;
  return (
    typeof row.id === "string" &&
    typeof row.name === "string" &&
    typeof row.categoryId === "string" &&
    (row.status === "pending" || row.status === "approved" || row.status === "rejected") &&
    typeof row.imageUrl === "string"
  );
}

async function putBlob(pathname: string, body: Buffer | string, contentType: string, maxAge: number) {
  const { put } = await import("@vercel/blob");
  return put(pathname, body, {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType,
    cacheControlMaxAge: maxAge,
  });
}

async function writeLocal(submission: DirectorySubmission, bytes: Uint8Array | null) {
  const dir = localDir();
  await mkdir(dir, { recursive: true });
  if (bytes) {
    const imagePath = path.join(dir, `${submission.id}.${submission.imageExt}`);
    await writeFile(imagePath, bytes);
  }
  const jsonPath = path.join(dir, `${submission.id}.json`);
  await writeFile(jsonPath, JSON.stringify(submission), "utf8");
}

export async function createSubmission(input: SubmissionInput): Promise<DirectorySubmission> {
  if (!blobEnabled() && process.env.VERCEL) {
    throw new Error("BLOB_READ_WRITE_TOKEN is not set");
  }

  const id = randomUUID();
  const submission: DirectorySubmission = {
    id,
    name: input.name,
    krewe: input.krewe,
    categoryId: input.categoryId,
    offer: input.offer,
    contact: input.contact,
    website: input.website,
    status: "pending",
    createdAt: new Date().toISOString(),
    imageAlt: `${input.name} logo`,
    imageContentType: input.kind.contentType,
    imageExt: input.kind.ext,
    imageUrl: `/api/directory/media/${id}`,
    flyerToken: randomUUID(),
  };

  if (blobEnabled()) {
    const image = await putBlob(
      `${PREFIX}/${id}.${input.kind.ext}`,
      Buffer.from(input.bytes),
      input.kind.contentType,
      60 * 60 * 24 * 30,
    );
    submission.imageUrl = image.url;
    await putBlob(
      `${PREFIX}/${id}.json`,
      JSON.stringify(submission),
      "application/json",
      60,
    );
    return submission;
  }

  await writeLocal(submission, input.bytes);
  return submission;
}

async function readBlobJson(url: string): Promise<DirectorySubmission | null> {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) return null;
  const value: unknown = await response.json();
  return isSubmission(value) ? value : null;
}

export async function listSubmissions(): Promise<DirectorySubmission[]> {
  if (blobEnabled()) {
    const { list } = await import("@vercel/blob");
    const blobs = [];
    let cursor: string | undefined;
    do {
      const page = await list({ prefix: `${PREFIX}/`, cursor, limit: 1000 });
      blobs.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);

    const jsonBlobs = blobs.filter((blob) => blob.pathname.endsWith(".json"));
    const rows = await Promise.all(jsonBlobs.map((blob) => readBlobJson(blob.url)));
    return rows
      .filter((row): row is DirectorySubmission => row !== null)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  let names: string[] = [];
  try {
    names = await readdir(localDir());
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const rows = await Promise.all(
    names
      .filter((name) => name.endsWith(".json"))
      .map(async (name) => {
        try {
          const raw = await readFile(path.join(localDir(), name), "utf8");
          const value: unknown = JSON.parse(raw);
          return isSubmission(value) ? value : null;
        } catch {
          return null;
        }
      }),
  );
  return rows
    .filter((row): row is DirectorySubmission => row !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getSubmission(id: string): Promise<DirectorySubmission | null> {
  assertId(id);
  const rows = await listSubmissions();
  return rows.find((row) => row.id === id) ?? null;
}

export async function attachFlyer(
  id: string,
  token: string,
  bytes: Uint8Array,
  kind: FlyerKind,
): Promise<DirectorySubmission | null> {
  assertId(id);
  const current = await getSubmission(id);
  if (!current || current.status !== "pending") return null;
  if (!current.flyerToken || current.flyerToken !== token) return null;

  const next: DirectorySubmission = {
    ...current,
    flyerContentType: kind.contentType,
    flyerExt: kind.ext,
    flyerUrl: `/api/directory/media/${id}/flyer`,
  };
  delete next.flyerToken;

  if (blobEnabled()) {
    const stored = await putBlob(
      `${PREFIX}/${id}.flyer.${kind.ext}`,
      Buffer.from(bytes),
      kind.contentType,
      60 * 60 * 24 * 30,
    );
    next.flyerUrl = stored.url;
    await putBlob(`${PREFIX}/${id}.json`, JSON.stringify(next), "application/json", 60);
    return next;
  }

  const dir = localDir();
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${id}.flyer.${kind.ext}`), bytes);
  await writeLocal(next, null);
  return next;
}

export async function deleteSubmission(id: string): Promise<void> {
  assertId(id);
  const current = await getSubmission(id);
  if (!current) return;

  if (blobEnabled()) {
    const { del } = await import("@vercel/blob");
    const pathnames = [
      `${PREFIX}/${id}.json`,
      `${PREFIX}/${id}.${current.imageExt}`,
    ];
    if (current.flyerExt) pathnames.push(`${PREFIX}/${id}.flyer.${current.flyerExt}`);
    await del(pathnames);
    return;
  }

  const { unlink } = await import("fs/promises");
  const dir = localDir();
  await Promise.all(
    [
      path.join(dir, `${id}.json`),
      path.join(dir, `${id}.${current.imageExt}`),
      current.flyerExt ? path.join(dir, `${id}.flyer.${current.flyerExt}`) : null,
    ]
      .filter((file): file is string => Boolean(file))
      .map((file) => unlink(file).catch(() => undefined)),
  );
}

export async function setSubmissionStatus(
  id: string,
  status: SubmissionStatus,
): Promise<DirectorySubmission | null> {
  assertId(id);
  const current = await getSubmission(id);
  if (!current) return null;
  const next = { ...current, status };
  if (status !== "pending") delete next.flyerToken;
  if (blobEnabled()) {
    await putBlob(`${PREFIX}/${id}.json`, JSON.stringify(next), "application/json", 60);
    return next;
  }
  await writeLocal(next, null);
  return next;
}

export async function readLocalFlyer(id: string): Promise<Uint8Array | null> {
  assertId(id);
  const submission = await getSubmission(id);
  if (!submission?.flyerExt || submission.flyerUrl?.startsWith("https://")) return null;
  try {
    const bytes = await readFile(path.join(localDir(), `${id}.flyer.${submission.flyerExt}`));
    return new Uint8Array(bytes);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export async function readLocalSubmissionImage(id: string): Promise<Uint8Array | null> {
  assertId(id);
  const submission = await getSubmission(id);
  if (!submission || submission.imageUrl.startsWith("https://")) return null;
  try {
    const bytes = await readFile(path.join(localDir(), `${id}.${submission.imageExt}`));
    return new Uint8Array(bytes);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

export function submissionToListing(submission: DirectorySubmission): DirectoryListing {
  const imageFlyer =
    Boolean(submission.flyerUrl) && submission.flyerContentType !== "application/pdf";
  return {
    id: `${submission.categoryId}:${submission.id}`,
    name: submission.name,
    summary: submission.offer,
    status: "listed",
    badge: "Listed",
    image: submission.imageUrl,
    imageAlt: submission.imageAlt,
    flyerImage: imageFlyer ? submission.flyerUrl : undefined,
    flyerAlt: imageFlyer ? `${submission.name} marketing flyer` : undefined,
    flyerHref: imageFlyer ? submission.flyerUrl : undefined,
    flyerLabel: imageFlyer ? "Open flyer" : undefined,
    meta: submissionMeta(submission),
  };
}

function submissionMeta(submission: DirectorySubmission): ListingMeta[] {
  const meta: ListingMeta[] = [{ label: submission.krewe }];
  const website = websiteMeta(submission.website);
  if (website) meta.push(website);
  meta.push(contactMeta(submission.contact));
  if (submission.flyerUrl && submission.flyerContentType === "application/pdf") {
    meta.push({ label: "View flyer", href: submission.flyerUrl, external: true });
  }
  return meta;
}

function contactMeta(contact: string): ListingMeta {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)) {
    return { label: contact, href: `mailto:${contact}` };
  }
  const digits = contact.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length >= 10) {
    return { label: contact, href: `tel:${digits}` };
  }
  return { label: contact };
}

function websiteMeta(website: string): ListingMeta | null {
  if (!website) return null;
  try {
    const url = new URL(website.startsWith("http") ? website : `https://${website}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return {
      label: url.host.replace(/^www\./, ""),
      href: url.href,
      external: true,
    };
  } catch {
    return null;
  }
}

export type SubmissionField =
  | "name"
  | "krewe"
  | "category"
  | "offer"
  | "contact"
  | "website"
  | "image"
  | "flyer"
  | "form";

export type SubmissionErrors = Partial<Record<SubmissionField, string>>;

export function validateSubmissionFields(input: {
  name: string;
  krewe: string;
  categoryId: string;
  offer: string;
  contact: string;
  website: string;
}): SubmissionErrors {
  const errors: SubmissionErrors = {};
  if (!input.name || input.name.length > 80) {
    errors.name = "Add the business name (80 characters or fewer).";
  }
  if (!input.krewe || input.krewe.length > 80) {
    errors.krewe = "Add the krewe you ride with (80 characters or fewer).";
  }
  if (!isDirectoryCategoryId(input.categoryId)) {
    errors.category = "Choose a category.";
  }
  if (!input.offer || input.offer.length > 500) {
    errors.offer = "Say what you offer, in 500 characters or fewer.";
  }
  if (!input.contact || input.contact.length > 120) {
    errors.contact = "Add an email or phone number.";
  }
  if (input.website.length > 200) {
    errors.website = "That website address is too long.";
  } else if (input.website && !websiteMeta(input.website)) {
    errors.website = "Use a full website address, like https://example.com.";
  }
  return errors;
}

export function validateSubmissionImage(bytes: Uint8Array): {
  kind: ListingImageKind | null;
  error?: string;
} {
  if (bytes.byteLength === 0) {
    return { kind: null, error: "Add a logo or photo (JPG, PNG, or WebP, up to 4 MB)." };
  }
  if (bytes.byteLength > MAX_LISTING_IMAGE_BYTES) {
    return { kind: null, error: "That image is over 4 MB. Try a smaller file." };
  }
  const kind = sniffListingImage(bytes);
  if (!kind) {
    return { kind: null, error: "Use a JPG, PNG, or WebP image." };
  }
  return { kind };
}

export function validateFlyer(bytes: Uint8Array): {
  kind: FlyerKind | null;
  error?: string;
} {
  if (bytes.byteLength === 0) {
    return { kind: null, error: "Add a flyer file, or leave that field empty." };
  }
  if (bytes.byteLength > MAX_FLYER_BYTES) {
    return { kind: null, error: "That flyer is over 4 MB. Try a smaller file." };
  }
  const kind = sniffFlyer(bytes);
  if (!kind) {
    return { kind: null, error: "Use a JPG, PNG, WebP, or PDF for the flyer." };
  }
  return { kind };
}

export function categoryChoices() {
  return DIRECTORY_CATEGORIES.map((category) => ({
    id: category.id,
    label: category.label,
  }));
}
