"use client";

import { useState } from "react";
import { DIRECTORY_CATEGORIES } from "@/lib/directory";
import { MAX_LISTING_IMAGE_BYTES } from "@/lib/directory-image";

type Errors = Partial<
  Record<"name" | "krewe" | "category" | "offer" | "contact" | "website" | "image" | "form", string>
>;

export function RequestListingForm() {
  const [errors, setErrors] = useState<Errors>({});
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");

  function onFile(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setPreview(null);
      setFileName("");
      return;
    }
    setFileName(file.name);
    setPreview(URL.createObjectURL(file));
    if (file.size > MAX_LISTING_IMAGE_BYTES) {
      setErrors((current) => ({
        ...current,
        image: "That image is over 4 MB. Try a smaller file.",
      }));
    } else if (!/image\/(jpeg|png|webp)/.test(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setErrors((current) => ({
        ...current,
        image: "Use a JPG, PNG, or WebP image.",
      }));
    } else {
      setErrors((current) => ({ ...current, image: undefined }));
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setErrors({});
    const form = event.currentTarget;
    try {
      const response = await fetch("/api/directory/submissions", {
        method: "POST",
        body: new FormData(form),
      });
      const data = (await response.json()) as { ok?: boolean; errors?: Errors };
      if (!response.ok || !data.ok) {
        setErrors(data.errors ?? { form: "Something went wrong. Try again." });
        return;
      }
      setDone(true);
      form.reset();
      onFile(null);
    } catch {
      setErrors({ form: "Something went wrong. Try again." });
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="kk-form__success" role="status">
        <h2>Request received</h2>
        <p>
          Thanks. Your logo is saved with the request. It stays off the public
          directory until Missy confirms the business is krewe-owned and Tampa
          Bay local.
        </p>
        <a className="kk-btn" href="/directory">
          Back to the directory
        </a>
      </div>
    );
  }

  return (
    <form className="kk-form" onSubmit={onSubmit} noValidate>
      <div className="kk-hp" aria-hidden="true">
        <label>
          Company
          <input type="text" name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {errors.form ? (
        <p className="kk-form__banner" role="alert">
          {errors.form}
        </p>
      ) : null}

      <label className="kk-field">
        <span>Business name</span>
        <input name="name" required maxLength={80} autoComplete="organization" />
        {errors.name ? <small role="alert">{errors.name}</small> : null}
      </label>

      <label className="kk-field">
        <span>Krewe</span>
        <input name="krewe" required maxLength={80} />
        {errors.krewe ? <small role="alert">{errors.krewe}</small> : null}
      </label>

      <label className="kk-field">
        <span>Category</span>
        <select name="category" required defaultValue="websites">
          {DIRECTORY_CATEGORIES.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        {errors.category ? <small role="alert">{errors.category}</small> : null}
      </label>

      <label className="kk-field">
        <span>What you offer</span>
        <textarea name="offer" required maxLength={500} rows={4} />
        {errors.offer ? <small role="alert">{errors.offer}</small> : null}
      </label>

      <label className="kk-field">
        <span>Contact</span>
        <input
          name="contact"
          required
          maxLength={120}
          autoComplete="email"
          placeholder="Email or phone"
        />
        {errors.contact ? <small role="alert">{errors.contact}</small> : null}
      </label>

      <label className="kk-field">
        <span>Website <em>optional</em></span>
        <input name="website" maxLength={200} inputMode="url" placeholder="https://" />
        {errors.website ? <small role="alert">{errors.website}</small> : null}
      </label>

      <div className="kk-field">
        <label htmlFor="listing-image">Logo or photo</label>
        <input
          id="listing-image"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          required
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
        <p className="kk-field__hint">JPG, PNG, or WebP. Up to 4 MB. Square or landscape.</p>
        {fileName ? <p className="kk-field__file">{fileName}</p> : null}
        {preview ? (
          <div className="kk-form__preview">
            {/* Local preview of the file the owner just picked. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" />
          </div>
        ) : null}
        {errors.image ? <small role="alert">{errors.image}</small> : null}
      </div>

      <button className="kk-btn" type="submit" disabled={pending}>
        {pending ? "Sending…" : "Submit listing"}
      </button>
    </form>
  );
}
