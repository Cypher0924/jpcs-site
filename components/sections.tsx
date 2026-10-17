import Link from "next/link";
import {
  about,
  contact,
  events,
  faqs,
  gallery,
  merch,
  navLinks,
  nextEvent,
  officerGroups,
  peso,
  stats,
  type Event,
} from "@/lib/content";
import { Fragment } from "react";
import { Countdown } from "./countdown";
import { OfficerCard } from "./officer-card";
import { OfficerCarousel } from "./officer-carousel";
import { PhotoGrid } from "./photo-grid";
import { Stat } from "./stat";
import { Button, CheckeredStrip, Chevrons, Container, InProgress, LogoMark, PhotoSlot, SectionHeader, SpeedSlashes } from "./ui";

export function About() {
  return (
    <section id="about" className="py-20 md:py-28">
      <Container>
        <SectionHeader title="Team briefing" sub="Who JPCS-TSU is, and the mission and vision the chapter works toward." />
        <div data-anim="rise" className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          <PhotoSlot
            label={about.photoAlt}
            src={about.photo}
            sizes="(min-width: 1024px) 600px, 100vw"
            className="aspect-[4/3] lg:col-span-6"
          />
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div>
              <h3 className="type-heading">Who we are</h3>
              <p className="mt-3 text-ink-muted">{about.who}</p>
              <p className="mt-3 text-ink-muted">{about.whoMore}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Mission", "Race strategy", about.mission],
                ["Vision", "Championship goal", about.vision],
              ].map(([title, tag, body]) => (
                <article key={title} className="cut-corner border border-line bg-surface p-5">
                  <p className="type-label text-accent-text">{tag}</p>
                  <h3 className="type-heading mt-2">{title}</h3>
                  <p className="mt-2 text-sm text-ink-muted">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Stats() {
  return (
    <section aria-label="JPCS-TSU in numbers" className="telemetry-grid border-y border-line bg-surface-2 py-14">
      <Container data-anim="rise" className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </Container>
    </section>
  );
}

export function Officers() {
  return (
    <section id="officers" className="py-20 md:py-28">
      <Container>
        <SectionHeader
          title="Driver lineup"
          sub="The JPCS-TSU officers, executive associates and apprentices for A.Y. 2026-2027. Tap a card to flip it."
        />
        {/* One block per category, each under its own heading, starting with the adviser alone on top.
            Mobile: each group is a swipe carousel (~1.3 cards) with position dots. From md up: centred
            rows of 3 / 4, so short rows sit in the middle like a pyramid. */}
        <div className="flex flex-col gap-12 md:gap-14">
          {officerGroups.map((g) => (
            <div key={g.officers[0].slug}>
              <h3 className="type-heading mb-6 text-center">
                {g.title}
                {g.officers.length > 1 && (
                  <span className="type-data text-sm text-ink-muted"> · {String(g.officers.length).padStart(2, "0")}</span>
                )}
              </h3>
              <OfficerCarousel count={g.officers.length}>
                {g.officers.map((o, i) => (
                  <Fragment key={o.slug}>
                    <li className="flex w-[75%] shrink-0 snap-start md:mb-6 md:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]">
                      <OfficerCard officer={o} />
                    </li>
                    {g.breaks?.includes(i) && <li aria-hidden className="hidden basis-full md:block" />}
                  </Fragment>
                ))}
              </OfficerCarousel>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Events() {
  return (
    <section id="events" className="bg-surface-2 py-20 md:py-28">
      <Container>
        <SectionHeader title="Race calendar" sub="Every JPCS-TSU event this year, round by round." />
        <div className="grid gap-6 lg:grid-cols-12">
          <article data-anim="slide-in" className="cut-corner flex flex-col border border-line bg-surface lg:col-span-5">
            <PhotoSlot label="Event photo" className="aspect-[16/9]" />
            <div className="flex flex-1 flex-col gap-3 p-6">
              <span className="slant type-label self-start bg-signal px-3 py-2 text-white">
                <span className="unslant">Next round · {nextEvent.round}</span>
              </span>
              <h3 className="type-heading">{nextEvent.title}</h3>
              <p className="type-data text-sm text-ink-muted">{nextEvent.venue}</p>
              <p className="text-ink-muted">{nextEvent.blurb}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                {nextEvent.date ? <Countdown to={nextEvent.date} /> : <InProgress />}
                <Button href={contact.facebook} variant="outline">
                  Details
                </Button>
              </div>
            </div>
          </article>

          <ol data-anim="launch" className="flex flex-col gap-3 lg:col-span-7">
            {events.map((e) => (
              <li key={e.slug}>
                <EventRow event={e} />
              </li>
            ))}
            <li className="pt-2 text-center lg:text-right">
              <Link href="/events" className="type-label text-accent-text hover:underline">
                See past rounds →
              </Link>
            </li>
          </ol>
        </div>
      </Container>
    </section>
  );
}

/** Race-calendar row: date block, round, title and venue. Links to the event's page. */
export function EventRow({ event: e }: { event: Event }) {
  return (
    <Link
      href={`/events/${e.slug}`}
      className="group flex items-stretch border border-line bg-surface transition-colors hover:border-accent"
    >
      <span className="grid w-20 shrink-0 place-items-center bg-surface-2 py-3 text-center">
        <span>
          <span className="type-label block text-ink-muted">{e.month}</span>
          <span className="type-data block text-3xl">{e.day}</span>
        </span>
      </span>
      <span className="flex flex-1 items-center justify-between gap-4 px-5 py-4">
        <span>
          <span className="type-data mr-2 text-sm text-accent-text">{e.round}</span>
          <span className="type-heading text-lg">{e.title}</span>
          <span className="block text-sm text-ink-muted">{e.venue}</span>
        </span>
        {e.done ? (
          <span className="flex items-center gap-2">
            <span aria-hidden className="checkered block size-6 border border-line [background-size:8px_8px]" />
            <span className="type-label hidden text-ink-muted sm:inline">Finished</span>
          </span>
        ) : (
          <span aria-hidden className="text-2xl text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-accent-text">
            ›
          </span>
        )}
      </span>
    </Link>
  );
}

export function Gallery() {
  return (
    // data-strip="on" is set by components/motion.tsx on desktop (with motion allowed):
    // the grid becomes a horizontal filmstrip that pans while the section is pinned.
    <section
      id="gallery"
      className="group py-20 md:py-28 lg:data-[strip=on]:overflow-hidden lg:data-[strip=on]:py-20"
    >
      <Container>
        <SectionHeader title="Paddock" sub="Photos from JPCS-TSU events, credited to the people who took them." />
        <div data-anim="gallery-viewport">
          <ul
            data-anim="gallery-track"
            className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4 lg:group-data-[strip=on]:flex lg:group-data-[strip=on]:w-max lg:group-data-[strip=on]:gap-6"
          >
            {gallery.map((g, i) => (
              <li key={i} className={`lg:group-data-[strip=on]:shrink-0 ${i === 0 ? "col-span-2 md:row-span-2" : ""}`}>
                <figure className="flex h-full flex-col gap-2">
                  <PhotoSlot
                    label={g.caption}
                    src={g.src}
                    sizes={i === 0 ? "(min-width: 768px) 600px, 100vw" : "(min-width: 768px) 400px, 50vw"}
                    className={`lg:group-data-[strip=on]:h-[min(48vh,500px)] lg:group-data-[strip=on]:flex-none ${
                      i === 0
                        ? "aspect-[4/3] md:aspect-auto md:min-h-0 md:flex-1 lg:group-data-[strip=on]:aspect-[4/3]"
                        : "aspect-square lg:group-data-[strip=on]:aspect-[3/4]"
                    }`}
                  />
                  {/* Credit sits under the photo, never on it */}
                  <figcaption className="type-data text-xs text-ink-muted">
                    P{i + 1} · {g.caption} · Photo: {g.credit}
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-right">
          <Link href="/gallery" className="type-label text-accent-text hover:underline">
            Full gallery →
          </Link>
        </p>
      </Container>
    </section>
  );
}

type MerchGroup = (typeof merch.groups)[number];
type MerchItem = MerchGroup["items"][number];

/** Lowest price in a group, marked "from" when items differ or a price is only a starting price. */
function groupPrice(g: MerchGroup) {
  const prices = g.items.map((i) => i.price);
  const from = g.items.some((i) => "from" in i && i.from) || new Set(prices).size > 1;
  return `${from ? "From " : ""}${peso(Math.min(...prices))}`;
}

/** Pre-order button while the form is open, otherwise the checkered "finished" mark from the race calendar. */
export function MerchStatus() {
  return merch.open ? (
    <Button href={merch.form}>Pre-order now</Button>
  ) : (
    <p className="flex items-center gap-3">
      <span aria-hidden className="checkered block size-6 shrink-0 border border-line [background-size:8px_8px]" />
      <span>
        <span className="font-semibold">Pre-orders closed.</span>{" "}
        <span className="text-ink-muted">The 2026-2027 run was open {merch.window}.</span>
      </span>
    </p>
  );
}

/** Name and price, then what it is and who made it. Sits under each merch photo. */
export function MerchCaption({ item, creditLabel = "Design by" }: { item: MerchItem; creditLabel?: string }) {
  return (
    <span className="flex flex-col gap-1">
      <span className="flex items-baseline justify-between gap-3">
        <span className="font-semibold">{item.name}</span>
        <span className="type-data shrink-0 text-sm text-accent-text">
          {"from" in item && item.from ? "From " : ""}
          {peso(item.price)}
        </span>
      </span>
      {item.details && <span className="text-sm text-ink-muted">{item.details}</span>}
      {"credit" in item && item.credit && (
        <span className="type-data text-xs text-ink-muted">
          {creditLabel} {item.credit}
        </span>
      )}
    </span>
  );
}

export function Merch() {
  const shirts = merch.groups[0].items;
  return (
    <section id="merch" className="bg-surface-2 py-20 md:py-28">
      <Container>
        <SectionHeader title="Team kit" sub="The official JPCS 26/27 merch, designed by our own officers and members." />
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          <div data-anim="rise" className="lg:col-span-7">
            <PhotoGrid
              photos={shirts.map((s) => s.image)}
              label="JPCS 26/27 shirts"
              sizes="(min-width: 1024px) 340px, 50vw"
              captions={shirts.map((s) => (
                <MerchCaption key={s.name} item={s} />
              ))}
              className="grid grid-cols-2 gap-3 md:gap-4"
              tileClassName="aspect-square"
            />
          </div>

          <div data-anim="rise" className="flex flex-col gap-6 lg:col-span-5">
            <MerchStatus />
            <ul className="border-t border-line">
              {merch.groups.map((g) => (
                <li key={g.id}>
                  <Link
                    href={`/merch#${g.id}`}
                    className="group flex items-baseline justify-between gap-4 border-b border-line py-4 hover:text-accent-text"
                  >
                    <span className="type-heading text-lg">{g.title}</span>
                    <span className="type-data text-sm text-ink-muted group-hover:text-accent-text">{groupPrice(g)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <Button href="/merch" variant="outline" className="self-start">
              See the full kit
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function Join() {
  return (
    <section id="join" className="grain overflow-hidden bg-accent text-accent-ink">
      <CheckeredStrip anim="strip-a" className="[--ink:var(--color-carbon-950)]" />
      <Container className="relative py-20 text-center md:py-24">
        <span
          aria-hidden
          data-anim="boxbox"
          className="pointer-events-none absolute inset-0 -z-10 grid place-items-center font-condensed text-[clamp(8rem,4rem+18vw,21rem)] leading-none font-black whitespace-nowrap uppercase opacity-[0.08]"
        >
          Box box
        </span>
        <p className="type-label flex items-center justify-center gap-3">
          <SpeedSlashes /> Get your superlicence <SpeedSlashes />
        </p>
        <h2 className="mt-4 font-wide text-[clamp(1.75rem,1rem+3vw,4.5rem)] leading-none uppercase">
          Join JPCS-TSU
        </h2>
        <p className="mx-auto mt-4 max-w-xl">
          Represent the CS Community on and off the track. Membership is open to BS Computer Science students of
          TSU.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={contact.registration}
            className="slant type-label inline-flex min-h-12 items-center justify-center bg-carbon-950 px-8 text-white transition-colors hover:bg-jpcs-maroon"
          >
            <span className="unslant">Box, box: register now</span>
          </a>
          <a
            href={contact.facebook}
            className="slant type-label inline-flex min-h-12 items-center justify-center border-2 border-carbon-950 px-8 transition-colors hover:bg-carbon-950 hover:text-white"
          >
            <span className="unslant">Message us</span>
          </a>
        </div>
      </Container>
      <CheckeredStrip anim="strip-b" className="[--ink:var(--color-carbon-950)]" />
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28">
      <Container className="max-w-3xl">
        <SectionHeader title="Race control" sub="Answers to the questions we get most about joining and events." />
        <div data-anim="rise" className="flex flex-col gap-3">
          {faqs.map((f, i) => (
            <details key={f.q} open={i === 0} className="group border border-line bg-surface open:border-accent">
              <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <span className="type-data text-sm text-signal">{f.time}</span>
                <span className="flex-1 font-semibold">{f.q}</span>
                <span aria-hidden className="type-data text-xl text-ink-muted transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="border-t border-line px-5 py-4 pl-[4.75rem] text-ink-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function Footer({ base = "" }: { base?: string }) {
  return (
    <footer className="bg-carbon-950 text-paper-100">
      <CheckeredStrip className="[--ink:var(--color-paper-100)]" />
      <Container className="grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <LogoMark size={48} />
            <span className="leading-tight">
              <span className="block font-wide text-base">JPCS-TSU</span>
              <span className="block text-xs text-paper-400">College of Computer Studies</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-paper-400">
            Tarlac State University
            <br />
            Brgy. San Isidro, Tarlac City 2300
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-2">
          <p className="type-label text-jpcs-orange">Sections</p>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map(({ id, label }) => (
              <li key={id}>
                <a href={`${base}#${id}`} className="text-paper-400 hover:text-white">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <p className="type-label text-jpcs-orange">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-paper-400">
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-white">
                {contact.email}
              </a>
            </li>
            <li>
              <a href={contact.facebook} className="hover:text-white">
                fb.com{contact.handle}
              </a>
            </li>
            <li>
              <a href={contact.messenger} className="hover:text-white">
                Messenger
              </a>
            </li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <p className="type-label text-jpcs-orange">Partners</p>
          <div className="mt-4 flex gap-3">
            {["JPCS", "TSU", "CCS"].map((seal) => (
              <span key={seal} className="grid size-14 place-items-center rounded-full border border-carbon-700 type-label text-[10px]">
                {seal}
              </span>
            ))}
          </div>
        </div>
      </Container>

      <div className="border-t border-carbon-700">
        <Container className="flex flex-col items-start justify-between gap-4 py-6 text-sm text-paper-400 sm:flex-row sm:items-center">
          <p>© 2026 JPCS-TSU</p>
          <a
            href="#top"
            className="slant type-label inline-flex items-center gap-2 border border-carbon-700 px-4 py-3 text-paper-100 hover:border-jpcs-orange hover:text-jpcs-orange"
          >
            <span className="unslant inline-flex items-center gap-2">
              <Chevrons className="size-4" /> Pit exit · back to top
            </span>
          </a>
        </Container>
      </div>
    </footer>
  );
}
