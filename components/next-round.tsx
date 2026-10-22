"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Event, Round } from "@/lib/data";
import { dateRange, phase, pickNext, type Phase } from "@/lib/rounds";
import { Countdown } from "./countdown";
import { Button, InProgress, PhotoSlot, ToBeAnnounced } from "./ui";


/** the page's cache time on the server and first paint, then the visitor's clock, ticking each minute */
function useNow(at: number) {
  const [now, setNow] = useState(at);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/** countdown, "In progress", or why there's no countdown */
function Clock({ round, now }: { round: Round; now: number }) {
  const p = phase(round, now);
  if (p === "upcoming") return <Countdown to={round.startsAt!} />;
  if (p === "live") return <InProgress />;
  if (p === "postponed") return <span className="type-data text-xl text-signal">Postponed</span>;
  return <span className="type-data text-xl text-ink-muted">Date to be announced</span>;
}

/** the red card in Race calendar */
export function NextRoundCard({ rounds, at, facebook }: { rounds: Round[]; at: number; facebook: string }) {
  const now = useNow(at);
  const [next, then] = pickNext(rounds, now);

  return (
    // self-start: only as tall as its content, not stretched to the calendar list beside it
    <article data-anim="slide-in" className="cut-corner flex flex-col self-start border border-line bg-surface lg:col-span-5">
      {next && (
        <figure>
          <PhotoSlot label={`${next.title} pubmat`} src={next.cover} contain sizes="(min-width: 1024px) 480px, 100vw" className="aspect-[16/9]" />
          {next.cover && <figcaption className="type-data px-6 pt-3 text-xs text-ink-muted">Pubmat · {next.credit}</figcaption>}
        </figure>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <span className="slant type-label self-start bg-signal px-3 py-2 text-white">
          <span className="unslant">Next round · {next ? next.round : `R${rounds.length + 1}`}</span>
        </span>
        {next ? (
          <>
            <h3 className="type-heading">{next.title}</h3>
            <p className="type-data text-sm text-ink-muted">
              {phase(next, now) === "postponed" ? "New date to be announced" : dateRange(next.startsAt, next.endsAt)}
              {next.venue && ` · ${next.venue}`}
            </p>
            <p className="text-ink-muted">{next.summary}</p>
          </>
        ) : (
          <>
            <h3 className="type-heading">To be announced</h3>
            <p className="text-ink-muted">The next event will be posted here and on our Facebook page.</p>
          </>
        )}
        {then && (
          <p className="border-t border-line pt-3 text-sm text-ink-muted">
            Then: <span className="type-data text-ink">{then.round}</span>{" "}
            <Link href={`/events/${then.slug}`} className="font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-accent">
              {then.title}
            </Link>{" "}
            · <span className="type-data">{then.status === "postponed" ? "Postponed" : dateRange(then.startsAt, then.endsAt)}</span>
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
          {next ? <Clock round={next} now={now} /> : <span />}
          <Button href={next ? `/events/${next.slug}` : facebook} variant="outline">
            Details
          </Button>
        </div>
      </div>
    </article>
  );
}

/** the strip under the hero */
export function NextRoundBadge({ rounds, at }: { rounds: Round[]; at: number }) {
  const now = useNow(at);
  const [next] = pickNext(rounds, now);
  return (
    <>
      <span className="type-label text-signal">Next round · {next ? next.round : `R${rounds.length + 1}`}</span>
      {next ? <Clock round={next} now={now} /> : <ToBeAnnounced />}
    </>
  );
}

const statusText: Record<Phase, string> = {
  finished: "Finished",
  live: "In progress",
  upcoming: "Upcoming",
  tba: "Date TBA",
  postponed: "Postponed",
  cancelled: "Cancelled",
};

/** a round's state in words, kept right by the visitor's clock even when the page is a day old */
export function RoundStatus({ round, at }: { round: Pick<Event, "startsAt" | "endsAt" | "status">; at: number }) {
  return statusText[phase(round, useNow(at))];
}

/** right end of a Race calendar row: chequered flag when finished, otherwise where the round stands */
export function RowStatus({ round, at }: { round: Pick<Event, "startsAt" | "endsAt" | "status">; at: number }) {
  const p = phase(round, useNow(at));
  if (p === "finished")
    return (
      <span className="flex items-center gap-2">
        <span aria-hidden className="checkered block size-6 border border-line [background-size:8px_8px]" />
        <span className="type-label hidden text-ink-muted sm:inline">Finished</span>
      </span>
    );
  if (p === "live")
    return (
      <span className="type-label flex items-center gap-2 text-ink">
        <span aria-hidden className="size-2 rounded-full bg-signal motion-safe:animate-pulse" />
        In progress
      </span>
    );
  if (p === "postponed") return <span className="type-label text-signal">Postponed</span>;
  return (
    <span aria-hidden className="text-2xl text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-accent-text">
      ›
    </span>
  );
}
