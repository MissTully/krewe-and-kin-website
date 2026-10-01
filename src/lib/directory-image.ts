export const MAX_LISTING_IMAGE_BYTES = 4 * 1024 * 1024;
/** Same cap as the card image. Each file is uploaded on its own so a logo and a flyer can both be this size. */
export const MAX_FLYER_BYTES = 4 * 1024 * 1024;

export type ListingImageKind = {
  ext: "jpg" | "png" | "webp";
  contentType: "image/jpeg" | "image/png" | "image/webp";
};

export type FlyerKind =
  | ListingImageKind
  | { ext: "pdf"; contentType: "application/pdf" };

/** Accept JPEG, PNG, and WebP by magic bytes, not the filename. */
export function sniffListingImage(bytes: Uint8Array): ListingImageKind | null {
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return { ext: "jpg", contentType: "image/jpeg" };
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return { ext: "png", contentType: "image/png" };
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return { ext: "webp", contentType: "image/webp" };
  }

  return null;
}

/** JPG, PNG, WebP, or PDF. Checked by magic bytes, not the filename. */
export function sniffFlyer(bytes: Uint8Array): FlyerKind | null {
  const image = sniffListingImage(bytes);
  if (image) return image;
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) {
    return { ext: "pdf", contentType: "application/pdf" };
  }
  return null;
}
