import type { Metadata } from "next";
import { Subpage } from "@/components/subpage";
import { Button, Chevrons, SpeedSlashes } from "@/components/ui";

export const metadata: Metadata = { title: "Off track · JPCS-TSU" };

// unknown URLs and notFound() (missing events) both land here
export default function NotFound() {
  return (
    <Subpage>
      <section className="relative grid min-h-[60vh] place-items-center overflow-hidden text-center">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 grid place-items-center font-condensed text-[clamp(10rem,6rem+20vw,22rem)] leading-none font-black text-ink opacity-[0.07]"
        >
          404
        </span>
        <div>
          <p className="type-label flex items-center justify-center gap-3 text-accent-text">
            <SpeedSlashes /> Race control <SpeedSlashes />
          </p>
          <h1 className="type-title mt-4 text-ink">Off track</h1>
          <p className="mx-auto mt-4 max-w-md text-ink-muted">
            This page left the racing line. The link may be old, or the page has moved.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button href="/">
              <span className="inline-flex items-center gap-2">
                <Chevrons className="size-4" /> Back to the grid
              </span>
            </Button>
            <Button href="/events" variant="outline">
              Race calendar
            </Button>
          </div>
        </div>
      </section>
    </Subpage>
  );
}
