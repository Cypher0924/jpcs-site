import Link from "next/link";
import { sections, type Code } from "@/components/admin/sections";
import { PageHeader, Panel } from "@/components/admin/shell";
import { StatusChip } from "@/components/admin/status";
import { buttonClass, linkClass } from "@/components/admin/styles";
import { Countdown } from "@/components/countdown";
import { InProgress } from "@/components/ui";
import { getEditors, lastEdited, requestNow } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { dateRange, phase, pickNext, type Status } from "@/lib/rounds";
import { group, type AuditRow } from "./audit/describe";
import { Message } from "./audit/message";

export const metadata = { title: { absolute: "Dashboard · Admin · JPCS-TSU" } };
// admin pages wait for the session check on navigation, which is fine here
export const instant = false;

type Edited = { updated_at: string; updated_by: string | null } | null;

export default async function DashboardPage() {
  const staff = await requireStaff();
  const db = await sessionClient();
  const count = async (table: string) => (await db.from(table).select("id", { count: "exact", head: true })).count ?? 0;
  const latest = async (table: string) =>
    (await db.from(table).select("updated_at, updated_by").order("updated_at", { ascending: false }).limit(1).maybeSingle()).data as Edited;

  const [rounds, officers, year, gallery, merch, merchOpen, stats, team, editors, recent, edited] = await Promise.all([
    // numbered like the site: by date, cancelled rounds left out
    db
      .from("events")
      .select("id, slug, title, venue, cover, starts_at, ends_at, status")
      .neq("status", "cancelled")
      .order("starts_at", { nullsFirst: false })
      .order("id")
      .then((r) =>
        (r.data ?? []).map((e, i) => ({
          round: i + 1,
          id: e.id as number,
          slug: e.slug as string,
          title: e.title as string,
          venue: e.venue as string,
          cover: e.cover as string | null,
          startsAt: e.starts_at as string | null,
          endsAt: e.ends_at as string | null,
          status: e.status as Status,
        })),
      ),
    // officers in the current school year only
    db
      .from("officers")
      .select("id, school_years!inner(is_current)", { count: "exact", head: true })
      .eq("school_years.is_current", true)
      .then((r) => r.count ?? 0),
    db.from("school_years").select("label").eq("is_current", true).maybeSingle().then((r) => r.data?.label as string | undefined),
    count("gallery_items"),
    count("merch_items"),
    db.from("merch_settings").select("open").single().then((r) => Boolean(r.data?.open)),
    count("stats"),
    count("profiles"),
    getEditors(),
    // RLS returns nothing here for editors, the audit log is admin-only
    db.from("audit_log").select("*").order("at", { ascending: false }).limit(10).then((r) => (r.data ?? []) as AuditRow[]),
    Promise.all(["events", "officers", "gallery_items", "merch_items", "stats"].map(latest)),
  ]);

  const now = await requestNow();
  const events = rounds.length;
  const [next] = pickNext(rounds, now);
  const nextPhase = next && phase(next, now);
  const nextChip: { status: "live" | "pending"; text: string } = !next
    ? { status: "pending", text: "To be announced" }
    : nextPhase === "live"
      ? { status: "live", text: "In progress" }
      : nextPhase === "upcoming"
        ? { status: "live", text: "Upcoming" }
        : { status: "pending", text: nextPhase === "postponed" ? "Postponed" : "Date TBA" };

  // what each tower row reports on the board: a number in timing type, then words
  type Line = { num?: string; label: string; chip?: { status: "live" | "pending"; text: string }; edited?: Edited };
  const board: Partial<Record<Code, Line>> = {
    EVT: { num: String(events), label: events === 1 ? "round" : "rounds", edited: edited[0] },
    OFF: { num: String(officers), label: year ? `officers in ${year}` : "officers, no current year", edited: edited[1] },
    PAD: { num: String(gallery), label: gallery === 1 ? "photo" : "photos", edited: edited[2] },
    MER: {
      num: String(merch),
      label: merch === 1 ? "item" : "items",
      chip: merchOpen ? { status: "live", text: "Pre-orders open" } : { status: "pending", text: "Pre-orders closed" },
      edited: edited[3],
    },
    STA: { num: String(stats), label: stats === 1 ? "stat" : "stats", edited: edited[4] },
    TEM: { num: String(team), label: team === 1 ? "member" : "members" },
    AUD: { label: "Every change, with before and after" },
  };
  const rows = sections.filter((s) => board[s.code] && (!s.adminOnly || staff.role === "admin"));

  return (
    <>
      <PageHeader
        code="DSH"
        title="Dashboard"
        sub={`Signed in as ${staff.email} (${staff.role}). Changes go live on the public site as soon as you save, and each one is recorded with your name.`}
      />


      {/* the round the homepage card is showing right now */}
      <div className="mb-8">
        <Panel title="Next round" meta={<StatusChip status={nextChip.status}>{nextChip.text}</StatusChip>}>
          {next ? (
            <div className="grid gap-5 sm:grid-cols-[14rem_minmax(0,1fr)]">
              <div className="grid aspect-[16/9] place-items-center overflow-hidden bg-surface-2">
                {next.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, already optimised on upload
                  <img src={next.cover} alt="" className="size-full object-contain" />
                ) : (
                  <span className="text-xs text-ink-muted">No pubmat yet</span>
                )}
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <p className="text-lg font-semibold">
                  <span className="type-data mr-2 text-ink-muted">R{next.round}</span>
                  {next.title}
                </p>
                <p className="type-data text-sm text-ink-muted">
                  {nextPhase === "postponed" ? "Postponed · new date to be announced" : dateRange(next.startsAt, next.endsAt)}
                  {next.venue && ` · ${next.venue}`}
                </p>
                <div className="mt-1">
                  {nextPhase === "upcoming" ? (
                    <Countdown to={next.startsAt!} />
                  ) : nextPhase === "live" ? (
                    <InProgress />
                  ) : (
                    <p className="text-sm text-ink-muted">
                      {nextPhase === "postponed"
                        ? "No countdown while it's postponed. Set the new start date and status Scheduled to bring it back."
                        : "Set a start date to show a countdown on the homepage."}
                    </p>
                  )}
                </div>
                <div className="mt-auto flex flex-wrap items-center gap-4 pt-2">
                  <Link href={`/admin/events/${next.id}`} className={buttonClass("secondary")}>
                    Edit event
                  </Link>
                  <Link href={`/events/${next.slug}`} target="_blank" className={linkClass}>
                    View on site
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="max-w-[60ch] text-sm text-ink-muted">
                Nothing is scheduled, so the homepage says &ldquo;To be announced&rdquo;. Add the next round in Events with its start date
                and it shows up here and on the homepage.
              </p>
              <Link href="/admin/events/new" className={buttonClass()}>
                New event
              </Link>
            </div>
          )}
        </Panel>
      </div>

      <section aria-labelledby="board-title" className="border border-line bg-surface">
        <header className="flex min-h-11 items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-2">
          <h2 id="board-title" className="text-sm font-semibold">
            Classification
          </h2>
          <span className="text-xs text-ink-muted">Pick a row to open it</span>
        </header>
        <div
          aria-hidden
          className="hidden grid-cols-[2rem_3rem_11rem_1fr_17rem_1rem] gap-x-3 border-b border-line px-4 py-2 text-xs font-semibold text-ink-muted lg:grid"
        >
          <span className="text-right">Pos</span>
          <span>Code</span>
          <span>Section</span>
          <span>Status</span>
          <span>Last edited</span>
        </div>
        <ol>
          {rows.map((s) => {
            const b = board[s.code]!;
            const edit = b.edited ? lastEdited(b.edited, editors) : "";
            return (
              <li key={s.code} className="border-b border-line last:border-0">
                <Link
                  href={s.href}
                  className="group grid min-h-14 grid-cols-[1.5rem_2.75rem_1fr_1rem] items-center gap-x-3 px-4 py-2.5 transition-colors hover:bg-surface-2 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-text lg:grid-cols-[2rem_3rem_11rem_1fr_17rem_1rem]"
                >
                  <span className="type-data text-right text-sm text-ink-muted">{s.pos}</span>
                  <span className="type-data text-sm">{s.code}</span>
                  <span className="min-w-0">
                    <span className="block font-semibold">{s.name}</span>
                    {/* phones and tablets: status and edit time under the name */}
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-muted lg:hidden">
                      <Figure line={b} />
                      {b.chip && <StatusChip status={b.chip.status}>{b.chip.text}</StatusChip>}
                    </span>
                    {edit && <span className="mt-0.5 block text-xs text-ink-muted lg:hidden">{edit}</span>}
                  </span>
                  <span className="hidden min-w-0 items-center gap-3 lg:flex">
                    <span className="min-w-0 truncate text-sm">
                      <Figure line={b} />
                    </span>
                    {b.chip && <StatusChip status={b.chip.status}>{b.chip.text}</StatusChip>}
                  </span>
                  <span className="hidden truncate text-xs text-ink-muted lg:block">{edit}</span>
                  <svg
                    aria-hidden
                    viewBox="0 0 16 16"
                    className="size-4 text-ink-muted transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-ink"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="m6 4 4 4-4 4" />
                  </svg>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {staff.role === "admin" && (
        <div className="mt-8">
          <Panel
            title="Race control messages"
            meta={
              <Link href="/admin/audit" className={`${linkClass} font-sans`}>
                Full audit log
              </Link>
            }
          >
            {recent.length === 0 ? (
              <p className="text-sm text-ink-muted">No changes yet. Edits made in the admin show up here.</p>
            ) : (
              <ul className="flex flex-col divide-y divide-line">
                {group(recent).map((rows) => (
                  <Message key={rows[0].id} rows={rows} />
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </>
  );
}

function Figure({ line }: { line: { num?: string; label: string } }) {
  return (
    <span>
      {line.num && <span className="type-data mr-1.5 text-ink">{line.num}</span>}
      {line.label}
    </span>
  );
}
