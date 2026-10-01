export const LISTING_REQUEST_PATH = "/directory/request";

export type ListingStatus = "founding" | "open" | "sample" | "listed";

export type ListingMeta = {
  label: string;
  href?: string;
  external?: boolean;
};

export type DirectoryListing = {
  id?: string;
  name: string;
  summary: string;
  status: ListingStatus;
  badge: string;
  meta: ListingMeta[];
  /**
   * Optional logo or photo. Repo files live in `public/directory/`
   * (`/directory/your-file.jpg`). Approved uploads use an `https://` Blob URL
   * or `/api/directory/media/{id}` in local dev.
   */
  image?: string;
  imageAlt?: string;
  /** Marketing flyer preview shown beside the listing when set. */
  flyerImage?: string;
  flyerAlt?: string;
  /** Opens the flyer file (PDF download or the full image). */
  flyerHref?: string;
  flyerLabel?: string;
};

const LOCAL_MEDIA_PREFIX = "/api/directory/media/";

/** Local files live in public/directory/. Remote images must be https. */
export function listingImageSrc(image: string | undefined): string | null {
  if (!image) return null;
  if (image.startsWith("/directory/")) return image;
  if (image.startsWith("https://")) return image;
  if (image.startsWith(LOCAL_MEDIA_PREFIX) && !image.includes("..")) return image;
  return null;
}

export type DirectoryCategory = {
  id: string;
  label: string;
  listings: DirectoryListing[];
};

const openSlot = (summary: string): DirectoryListing => ({
  name: "Your listing here",
  summary,
  status: "open",
  badge: "Open",
  meta: [{ label: "Open for submissions", href: LISTING_REQUEST_PATH }],
});

export const DIRECTORY_CATEGORIES: DirectoryCategory[] = [
  {
    id: "websites",
    label: "Websites",
    listings: [
      {
        name: "Krewe & Kin",
        summary:
          "Website studio for Tampa Bay krewes only. Public site + member portal — roster, dues, RSVPs, and the season in one place.",
        status: "founding",
        badge: "Founding listing",
        image: "/directory/krewe-and-kin-logo.png",
        imageAlt: "Krewe & Kin logo",
        flyerImage: "/directory/krewe-kin-studio-flyer.jpg",
        flyerAlt:
          "Krewe & Kin marketing flyer: Your krewe. One website. Website studio for Gasparilla krewes.",
        flyerHref: "/directory/krewe-kin-studio-flyer.jpg",
        flyerLabel: "Open flyer",
        meta: [
          {
            label: "Krewe of Shamrock",
            href: "https://www.kreweofshamrock.com/",
            external: true,
          },
          { label: "kreweandkin.com", href: "https://kreweandkin.com" },
          {
            label: "missy@kreweandkin.com",
            href: "mailto:missy@kreweandkin.com",
          },
          { label: "(813) 416-1641", href: "tel:+18134161641" },
        ],
      },
      openSlot(
        "Krewe members who build or redesign sites can apply. Name, what you do, which krewe you’re in, and how boards reach you.",
      ),
    ],
  },
  {
    id: "apps",
    label: "Apps",
    listings: [
      {
        name: "Member Hub builders",
        summary:
          "Private member apps for events, news, check-ins, and member passes. Example slot for krewe-owned app makers.",
        status: "sample",
        badge: "Sample",
        meta: [{ label: "Sample · replace with real vendor" }],
      },
      openSlot(
        "Built an app for your krewe? List it so other boards know who to call.",
      ),
    ],
  },
  {
    id: "print",
    label: "Print & Design",
    listings: [
      {
        name: "Parade print shop",
        summary:
          "Leave-behinds, ball invites, banners, and merch art from a krewe member’s shop. Placeholder until a real printer joins.",
        status: "sample",
        badge: "Sample",
        meta: [{ label: "Sample · replace with real vendor" }],
      },
      openSlot(
        "Graphic designers and print shops owned by krewe members welcome.",
      ),
    ],
  },
  {
    id: "photo",
    label: "Photo & Video",
    listings: [
      {
        name: "Photographers & videographers",
        summary:
          "Balls, parades, and krewe nights — shot by people who already know the season.",
        status: "open",
        badge: "Open",
        meta: [{ label: "Category open", href: LISTING_REQUEST_PATH }],
      },
    ],
  },
  {
    id: "food",
    label: "Food & Catering",
    listings: [
      {
        name: "Caterers",
        summary:
          "The food vendors boards already ask about in the group chat — this slot stays open for a krewe-owned caterer.",
        status: "open",
        badge: "Open",
        meta: [{ label: "Category open", href: LISTING_REQUEST_PATH }],
      },
    ],
  },
  {
    id: "entertainment",
    label: "Entertainment",
    listings: [
      {
        name: "DJs & bands",
        summary:
          "The people who keep krewe nights moving. This slot is open until a real act joins.",
        status: "open",
        badge: "Open",
        meta: [{ label: "Category open", href: LISTING_REQUEST_PATH }],
      },
    ],
  },
];

export function isDirectoryCategoryId(id: string): boolean {
  return DIRECTORY_CATEGORIES.some((category) => category.id === id);
}

/** Approved submissions sit with the real listings, ahead of samples and open slots. */
export function mergeApprovedListings(
  categories: DirectoryCategory[],
  approved: DirectoryListing[],
): DirectoryCategory[] {
  return categories.map((category) => {
    const incoming = approved.filter((listing) => listing.id?.startsWith(`${category.id}:`));
    if (incoming.length === 0) return category;
    const listings = [...category.listings];
    const insertAt = listings.findIndex(
      (listing) => listing.status === "sample" || listing.status === "open",
    );
    const at = insertAt === -1 ? listings.length : insertAt;
    listings.splice(at, 0, ...incoming);
    return { ...category, listings };
  });
}

export function categoryNote(category: DirectoryCategory): string {
  const real = category.listings.filter(
    (listing) => listing.status === "founding" || listing.status === "listed",
  );
  if (real.length > 0) {
    return real.length === 1 ? "1 listing" : `${real.length} listings`;
  }
  if (category.listings.every((listing) => listing.status === "open")) {
    return "Category open";
  }
  return "Sample placeholders";
}
