import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Subpage } from "@/components/subpage";
import { PhotoGrid } from "@/components/photo-grid";
import { Button, PhotoSlot } from "@/components/ui";
import { events } from "@/lib/content";

export function generateStaticParams() {
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/events/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const event = events.find((e) => e.slug === slug);
  return { title: event ? `${event.title} · JPCS-TSU` : "Event not found · JPCS-TSU" };
}

// nav, back link and footer are an instant shell. the event reads params so it sits behind Suspense (Partial Prefetching).
// all slugs are prerendered so the fallback rarely shows
export default function EventPage({ params }: PageProps<"/events/[slug]">) {
  return (
    <Subpage back={{ href: "/events", label: "Race calendar" }}>
      <Suspense fallback={<div className="min-h-[60vh]" />}>
        <EventDetails params={params} />
      </Suspense>
    </Subpage>
  );
}

async function EventDetails({ params }: { params: PageProps<"/events/[slug]">["params"] }) {
  const { slug } = await params;
  const i = events.findIndex((e) => e.slug === slug);
  if (i === -1) notFound();
  const event = events[i];
  const prev = events[i - 1];
  const next = events[i + 1];

  return (
    <>
      <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
        <div className="lg:col-span-7">
          <span className="slant type-label inline-block bg-accent px-3 py-2 text-accent-ink">
            <span className="unslant inline-block">
              Round {event.round.slice(1)} · {event.done ? "Finished" : "Upcoming"}
            </span>
          </span>
          <h1 className="type-title mt-4 text-ink">{event.title}</h1>
          <p className="type-data mt-3 text-sm text-ink-muted">
            {event.month === "TBA" ? "Date TBA" : `${event.month} ${event.day}`} · {event.venue}
          </p>
        </div>
        <div className="lg:col-span-5">
          <p className="text-ink-muted">{event.summary}</p>
          <p className="type-data mt-3 text-xs text-ink-muted">Photos: {event.credit}</p>
          {event.link && (
            <Button href={event.link.href} variant="outline" className="mt-6">
              {event.link.label}
            </Button>
          )}
        </div>
      </header>

      {!event.square && (
        <PhotoSlot
          label={event.title}
          src={event.cover}
          sizes="(min-width: 1280px) 1200px, 100vw"
          className="mt-10 aspect-[16/9]"
        />
      )}

      <PhotoGrid
        photos={event.photos}
        label={event.title}
        sizes="(min-width: 768px) 400px, 50vw"
        className={`grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 ${event.square ? "mt-10" : "mt-4"}`}
        tileClassName={event.square ? "aspect-square" : "aspect-[16/9]"}
      />

      <nav aria-label="Other rounds" className="mt-12 grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
        {prev ? (
          <Link href={`/events/${prev.slug}`} className="group border border-line bg-surface p-5 hover:border-accent">
            <span className="type-label block text-ink-muted">← Previous round · {prev.round}</span>
            <span className="type-heading mt-2 block text-lg">{prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={`/events/${next.slug}`} className="group border border-line bg-surface p-5 text-right hover:border-accent">
            <span className="type-label block text-ink-muted">Next round · {next.round} →</span>
            <span className="type-heading mt-2 block text-lg">{next.title}</span>
          </Link>
        )}
      </nav>
    </>
  );
}
