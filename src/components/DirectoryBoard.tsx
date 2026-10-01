"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";
import {
  DIRECTORY_CATEGORIES,
  categoryNote,
  listingImageSrc,
  type DirectoryCategory,
  type DirectoryListing,
} from "@/lib/directory";

const ALL = "all";

function categoryFromHash() {
  const hash = window.location.hash.replace("#", "");
  return DIRECTORY_CATEGORIES.some((category) => category.id === hash) ? hash : ALL;
}

function subscribeToHash(onStoreChange: () => void) {
  window.addEventListener("hashchange", onStoreChange);
  return () => window.removeEventListener("hashchange", onStoreChange);
}

export function DirectoryBoard({ categories }: { categories: DirectoryCategory[] }) {
  const active = useSyncExternalStore(subscribeToHash, categoryFromHash, () => ALL);

  function select(id: string) {
    const nextUrl = id === ALL ? "/directory" : `/directory#${id}`;
    window.history.replaceState(null, "", nextUrl);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    const targetId = id === ALL ? "directory-filters" : id;
    document.getElementById(targetId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  const visible = categories.filter(
    (category) => active === ALL || category.id === active,
  );

  return (
    <>
      <div
        id="directory-filters"
        className="kk-filters"
        role="group"
        aria-label="Filter listings by category"
      >
        <FilterButton
          label="All"
          pressed={active === ALL}
          onSelect={() => select(ALL)}
        />
        {DIRECTORY_CATEGORIES.map((category) => (
          <FilterButton
            key={category.id}
            label={category.label}
            pressed={active === category.id}
            onSelect={() => select(category.id)}
          />
        ))}
      </div>

      {visible.map((category) => (
        <CategorySection key={category.id} category={category} />
      ))}
    </>
  );
}

function FilterButton({
  label,
  pressed,
  onSelect,
}: {
  label: string;
  pressed: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={pressed ? "is-active" : undefined}
      aria-pressed={pressed}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}

function CategorySection({ category }: { category: DirectoryCategory }) {
  const headingId = `${category.id}-heading`;
  return (
    <section
      id={category.id}
      className="kk-section"
      aria-labelledby={headingId}
    >
      <div className="kk-section__head">
        <h2 id={headingId}>{category.label}</h2>
        <p className="kk-count">{categoryNote(category)}</p>
      </div>
      <div className="kk-grid">
        {category.listings.map((listing) => (
          <ListingCard key={listing.id ?? `${category.id}-${listing.name}`} listing={listing} />
        ))}
      </div>
    </section>
  );
}

function ListingCard({ listing }: { listing: DirectoryListing }) {
  const flyerSrc = listingImageSrc(listing.flyerImage);
  return (
    <article
      className={`kk-card kk-card--${listing.status}${flyerSrc ? " kk-card--with-flyer" : ""}`}
    >
      <div className="kk-card__main">
        <ListingMedia listing={listing} compact={Boolean(flyerSrc)} />
        <div className="kk-card__body">
          <div className="kk-card__top">
            <h3>{listing.name}</h3>
            <span className={`kk-badge kk-badge--${listing.status}`}>{listing.badge}</span>
          </div>
          <p className="kk-card__summary">{listing.summary}</p>
          <ul className="kk-meta">
            {listing.meta.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <a
                    href={item.href}
                    {...(item.external
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {item.label}
                  </a>
                ) : (
                  item.label
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
      {flyerSrc ? <ListingFlyer listing={listing} src={flyerSrc} /> : null}
    </article>
  );
}

function ListingFlyer({ listing, src }: { listing: DirectoryListing; src: string }) {
  const href = listing.flyerHref || src;
  const alt = listing.flyerAlt ?? `${listing.name} marketing flyer`;
  return (
    <figure className="kk-card__flyer">
      <a href={href} target="_blank" rel="noopener noreferrer">
        <span className="kk-card__flyer-frame">
          {src.startsWith("/directory/") ? (
            <Image
              className="kk-card__flyer-img"
              src={src}
              alt={alt}
              fill
              sizes="(min-width: 860px) 520px, 100vw"
            />
          ) : (
            // Uploaded flyers are https Blob URLs or the local media route.
            // eslint-disable-next-line @next/next/no-img-element
            <img className="kk-card__flyer-img" src={src} alt={alt} />
          )}
        </span>
        <span className="kk-card__flyer-link">{listing.flyerLabel ?? "Open flyer"}</span>
      </a>
    </figure>
  );
}

function ListingMedia({
  listing,
  compact = false,
}: {
  listing: DirectoryListing;
  compact?: boolean;
}) {
  const src = listingImageSrc(listing.image);
  const frame = `kk-card__media${compact ? " kk-card__media--logo" : ""}`;
  if (!src) {
    return (
      <div className={`${frame} kk-card__media--empty`} aria-hidden="true">
        <span>No image yet</span>
      </div>
    );
  }

  const alt = listing.imageAlt ?? "";
  if (!src.startsWith("/directory/")) {
    return (
      <div className={frame}>
        {/* Uploaded logos are https Blob URLs or the local media route. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="kk-card__photo" src={src} alt={alt} />
      </div>
    );
  }

  return (
    <div className={frame}>
      <Image
        className="kk-card__photo"
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 760px) 480px, 100vw"
      />
    </div>
  );
}
