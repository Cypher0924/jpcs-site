import Link from "next/link";
import type { Metadata } from "next";
import { Subpage } from "@/components/subpage";
import { PhotoGrid } from "@/components/photo-grid";
import { SectionHeader } from "@/components/ui";
import { contact, events } from "@/lib/content";

export const metadata: Metadata = { title: "Paddock · JPCS-TSU" };

export default function GalleryPage() {
  return (
    <Subpage back={{ href: "/#gallery", label: "Home" }}>
      <SectionHeader title="Paddock" sub="Photos from every JPCS-TSU event this year, grouped by round." />
      <div className="flex flex-col gap-16">
        {events.map((e) => (
          <section key={e.slug} aria-labelledby={`g-${e.slug}`}>
            <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
              <h2 id={`g-${e.slug}`} className="type-heading">
                <span className="type-data mr-2 text-sm text-accent-text">{e.round}</span>
                {e.title}
              </h2>
              <Link href={`/events/${e.slug}`} className="type-label text-accent-text hover:underline">
                Event details →
              </Link>
            </div>
            <PhotoGrid
              photos={[e.cover, ...e.photos]}
              label={e.title}
              sizes="(min-width: 768px) 300px, 50vw"
              className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4"
              tileClassName="aspect-square"
            />
          </section>
        ))}
      </div>
      <p className="mt-12 text-center text-sm text-ink-muted">
        Photos: JPCS-TSU. More on{" "}
        <a href={contact.facebook} className="text-accent-text hover:underline">
          fb.com{contact.handle}
        </a>
        .
      </p>
    </Subpage>
  );
}
