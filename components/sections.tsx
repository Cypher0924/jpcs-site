import { about, contact, faqs, gallery, navLinks, nextEvent, officers, programs, rounds, stats } from "@/lib/content";
import { Countdown } from "./countdown";
import { OfficerCard } from "./officer-card";
import { OfficerCarousel } from "./officer-carousel";
import { Stat } from "./stat";
import { Button, CheckeredStrip, Chevrons, Container, LogoMark, PhotoSlot, SectionHeader, SpeedSlashes } from "./ui";

const compoundColor = {
  soft: "var(--color-tyre-soft)",
  medium: "var(--color-tyre-medium)",
  hard: "var(--color-tyre-hard)",
} as const;

export function About() {
  return (
    <section id="about" className="py-20 md:py-28">
      <Container>
        <SectionHeader index="03" eyebrow="Team briefing" title="About JPCS-TSU" />
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          <PhotoSlot label="Photo: JPCS-TSU members, 4:3" className="aspect-[4/3] lg:col-span-6" />
          <div className="flex flex-col gap-6 lg:col-span-6">
            <div>
              <h3 className="type-heading">Who we are</h3>
              <p className="mt-3 text-ink-muted">{about.who}</p>
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
      <Container className="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-6">
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
        <SectionHeader index="05" eyebrow="Driver lineup" title="Officers" sub="Meet the team. Tap a card to flip it." />
        {/* Mobile: swipe carousel showing ~1.3 cards with position dots. Desktop: 4 x 2 grid. */}
        <OfficerCarousel count={officers.length}>
          {officers.map((o) => (
            <li key={o.number} className="w-[75%] shrink-0 snap-start md:w-auto">
              <OfficerCard officer={o} />
            </li>
          ))}
        </OfficerCarousel>
      </Container>
    </section>
  );
}

export function Events() {
  return (
    <section id="events" className="bg-surface-2 py-20 md:py-28">
      <Container>
        <SectionHeader index="06" eyebrow="Race calendar" title="Events" />
        <div className="grid gap-6 lg:grid-cols-12">
          <article className="cut-corner flex flex-col border border-line bg-surface lg:col-span-5">
            <div className="relative">
              <PhotoSlot label="Event photo" className="aspect-[16/9]" />
              <span className="slant type-label absolute top-4 left-4 bg-signal px-3 py-2 text-white">
                <span className="unslant">Next round · {nextEvent.round}</span>
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-3 p-6">
              <h3 className="type-heading">{nextEvent.title}</h3>
              <p className="type-data text-sm text-ink-muted">Date · {nextEvent.venue}</p>
              <p className="text-ink-muted">{nextEvent.blurb}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
                <Countdown to={nextEvent.date} />
                <Button href="#" variant="outline">
                  Details
                </Button>
              </div>
            </div>
          </article>

          <ol className="flex flex-col gap-3 lg:col-span-7">
            {rounds.map((r) => (
              <li key={r.round}>
                <a
                  href="#"
                  className="group flex items-stretch border border-line bg-surface transition-colors hover:border-accent"
                >
                  <span className="grid w-20 shrink-0 place-items-center bg-surface-2 py-3 text-center">
                    <span>
                      <span className="type-label block text-ink-muted">{r.month}</span>
                      <span className="type-data block text-3xl">{r.day}</span>
                    </span>
                  </span>
                  <span className="flex flex-1 items-center justify-between gap-4 px-5 py-4">
                    <span>
                      <span className="type-data mr-2 text-sm text-accent-text">{r.round}</span>
                      <span className="type-heading text-lg">{r.title}</span>
                      <span className="block text-sm text-ink-muted">{r.venue}</span>
                    </span>
                    {r.done ? (
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
                </a>
              </li>
            ))}
            <li className="pt-2 text-center lg:text-right">
              <a href="#" className="type-label text-accent-text hover:underline">
                See past rounds →
              </a>
            </li>
          </ol>
        </div>
      </Container>
    </section>
  );
}

export function Programs() {
  return (
    <section id="programs" className="py-20 md:py-28">
      <Container>
        <SectionHeader index="07" eyebrow="Garage bays" title="Programs & committees" />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {programs.map((p, i) => (
            <li key={i} className="cut-corner flex gap-4 border border-line bg-surface p-5 sm:flex-col">
              <span
                aria-hidden
                className="grid size-12 shrink-0 place-items-center rounded-full border-[5px] bg-carbon-900"
                style={{ borderColor: compoundColor[p.compound] }}
              >
                <span className="type-data text-xs text-white">{p.compound[0].toUpperCase()}</span>
              </span>
              <span>
                <span className="type-data text-xs text-ink-muted">BAY {String(i + 1).padStart(2, "0")}</span>
                <span className="type-heading mt-1 block text-lg">{p.name}</span>
                <span className="mt-2 block text-sm text-ink-muted">{p.blurb}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
          <span className="type-label">Tyre legend</span>
          {(["soft", "medium", "hard"] as const).map((c) => (
            <span key={c} className="inline-flex items-center gap-2 capitalize">
              <span aria-hidden className="size-3 rounded-full" style={{ background: compoundColor[c] }} />
              {c} · {c === "soft" ? "beginner" : c === "medium" ? "intermediate" : "advanced"}
            </span>
          ))}
        </p>
      </Container>
    </section>
  );
}

export function Gallery() {
  return (
    <section id="gallery" className="bg-surface-2 py-20 md:py-28">
      <Container>
        <SectionHeader index="08" eyebrow="Paddock" title="Gallery" />
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          {gallery.map((g, i) => (
            <li key={i} className={`relative ${i === 0 ? "col-span-2 md:row-span-2" : ""}`}>
              <PhotoSlot
                label={g.caption}
                tone="surface"
                className={i === 0 ? "aspect-[4/3] md:aspect-auto md:h-full" : "aspect-square"}
              />
              {/* Pit-board caption */}
              <span className="type-data absolute bottom-2 left-2 bg-carbon-950 px-2 py-1 text-[11px] text-chevron">
                P{i + 1} · Photo: {g.credit}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-right">
          <a href={contact.facebook} className="type-label text-accent-text hover:underline">
            View album →
          </a>
        </p>
      </Container>
    </section>
  );
}

export function Join() {
  return (
    <section id="join" className="grain overflow-hidden bg-accent text-accent-ink">
      <CheckeredStrip className="[--ink:var(--color-carbon-950)]" />
      <Container className="relative py-20 text-center md:py-24">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 grid place-items-center font-display text-[clamp(8rem,4rem+18vw,21rem)] leading-none font-black whitespace-nowrap uppercase opacity-[0.08] [font-stretch:62%]"
        >
          Box box
        </span>
        <p className="type-label flex items-center justify-center gap-3">
          <SpeedSlashes /> Get your superlicence <SpeedSlashes />
        </p>
        <h2 className="mt-4 font-display text-[clamp(2.5rem,1.6rem+4vw,5rem)] leading-none font-black uppercase italic [font-stretch:125%]">
          Join JPCS-TSU
        </h2>
        <p className="mx-auto mt-4 max-w-xl">
          Represent the Orange CS Community on and off the track. Membership is open to BS Computer Science students of
          TSU.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href="#"
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
      <CheckeredStrip className="[--ink:var(--color-carbon-950)]" />
    </section>
  );
}

export function Faq() {
  return (
    <section id="faq" className="py-20 md:py-28">
      <Container className="max-w-3xl">
        <SectionHeader index="10" eyebrow="Race control messages" title="FAQ" />
        <div className="flex flex-col gap-3">
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

export function Footer() {
  return (
    <footer className="bg-carbon-950 text-paper-100">
      <CheckeredStrip className="[--ink:var(--color-paper-100)]" />
      <Container className="grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-4">
          <div className="flex items-center gap-3">
            <LogoMark size={48} />
            <span className="leading-tight">
              <span className="block font-display text-lg font-extrabold italic [font-stretch:125%]">JPCS-TSU</span>
              <span className="block text-xs text-paper-400">College of Computer Studies</span>
            </span>
          </div>
          <p className="mt-4 text-sm text-paper-400">
            Tarlac State University
            <br />
            Brgy. San Isidro, Tarlac City
          </p>
        </div>

        <nav aria-label="Footer" className="md:col-span-2">
          <p className="type-label text-jpcs-orange">Sections</p>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map(({ id, label }) => (
              <li key={id}>
                <a href={`#${id}`} className="text-paper-400 hover:text-white">
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
              <a href="#" className="hover:text-white">
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
          <p>© 2026 JPCS-TSU · Website by (your name)</p>
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
