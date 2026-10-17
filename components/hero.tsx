import { nextEvent } from "@/lib/content";
import { Countdown } from "./countdown";
import { Button, Chevrons, Container, InProgress, SpeedSlashes } from "./ui";

export const LIGHT_STEP = 0.55; // seconds between each start light
export const LIGHTS_OUT = LIGHT_STEP * 5 + 0.6;

/** Five-column start-light gantry. Lights fill one by one, then go out. */
function StartLights() {
  return (
    <div data-anim="gantry" className="flex justify-center gap-2 sm:gap-3" role="img" aria-label="Five start lights filling one by one, then going out">
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-2 border border-line bg-surface p-2 sm:p-2.5">
          {[0, 1].map((row) => (
            <span
              key={row}
              className="block size-7 rounded-full bg-surface-2 sm:size-10"
              style={{
                animation: `light-on 120ms ${i * LIGHT_STEP + 0.4}s forwards, lights-out 80ms ${LIGHTS_OUT}s forwards`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function HeroVisual() {
  return (
    <div className="telemetry-grid grain relative flex aspect-[4/3] flex-col justify-between overflow-hidden border border-line bg-surface p-5 sm:p-8 lg:aspect-auto lg:h-full">
      {/* Season mark watermark, sits behind the gantry */}
      <span
        aria-hidden
        data-anim="watermark"
        className="pointer-events-none absolute inset-x-0 top-[12%] -z-10 text-center font-display text-[clamp(9rem,6rem+12vw,18.75rem)] leading-none font-black text-ink opacity-[0.07] [font-stretch:62%]"
      >
        26/27
      </span>

      <div className="flex items-start justify-between">
        <span className="type-label text-ink-muted">Race control</span>
        <span className="type-data text-xs text-ink-muted">S26/27 · TSU-CCS</span>
      </div>

      <StartLights />

      {/* Speed stripe: three skewed bars in the official palette */}
      <div aria-hidden className="relative h-16">
        <span data-anim="stripe" className="slant absolute inset-x-[-10%] top-0 h-4 bg-jpcs-maroon" />
        <span data-anim="stripe" className="slant absolute inset-x-[-10%] top-6 h-4 bg-accent" />
        <span data-anim="stripe" className="slant absolute inset-x-[-10%] top-12 h-4 bg-gold" />
      </div>

      <div className="flex items-end justify-between">
        <span className="type-label text-accent-text">Grid forming</span>
        <Chevrons className="size-8 text-accent" />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden" style={{ background: "var(--hero-wash)" }}>
      <Container className="grid gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-6 lg:py-24">
        <div data-anim="hero-copy" className="lg:col-span-6 lg:pr-6">
          <p className="mb-6 flex flex-wrap items-center gap-3 text-accent-text">
            <SpeedSlashes />
            <span className="type-label">JPCS-TSU · College of Computer Studies</span>
          </p>

          <h1 className="type-display text-ink">
            {["Lights out.", "Code on.", "CS Community."].map((line, i) => (
              <span
                key={line}
                className={`block ${i === 2 ? "text-accent-text" : ""}`}
                style={{ animation: `drop-in 500ms var(--ease-launch) ${LIGHTS_OUT + 0.1 + i * 0.12}s both` }}
              >
                {line}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-lg text-lg text-ink-muted">
            The Junior Philippine Computer Society, Tarlac State University chapter. We are the BS Computer Science
            students on the grid, learning, building and racing forward together.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="#join">Join JPCS</Button>
            <Button href="#events" variant="outline">
              See events
            </Button>
          </div>

          <a
            href="#events"
            className="mt-8 inline-flex flex-wrap items-center gap-x-4 gap-y-2 border-l-4 border-signal bg-surface px-4 py-3"
          >
            <span className="type-label text-signal">Next round · {nextEvent.round}</span>
            {nextEvent.date ? <Countdown to={nextEvent.date} /> : <InProgress />}
          </a>
        </div>

        <div className="lg:col-span-6">
          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}
