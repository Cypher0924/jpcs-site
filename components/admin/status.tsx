// status chips in timing-screen colours: green live, amber pending, chequered finished
import type { Phase } from "@/lib/rounds";

type Status = "finished" | "live" | "pending" | "cancelled";

export function StatusChip({ status, children }: { status: Status; children: string }) {
  return (
    <span
      className={`inline-flex h-6 items-center gap-1.5 border px-2 text-xs font-semibold whitespace-nowrap ${
        status === "live"
          ? "border-live/40 text-live-text"
          : status === "pending"
            ? "border-gold/50 text-pending-text"
            : status === "cancelled"
              ? "border-signal/50 text-signal"
              : "border-line text-ink"
      }`}
    >
      {status === "finished" ? (
        <span aria-hidden className="checkered size-2.5 [background-size:5px_5px]" />
      ) : (
        <span aria-hidden className={`size-1.5 rounded-full ${status === "live" ? "bg-live" : status === "cancelled" ? "bg-signal" : "bg-gold"}`} />
      )}
      {children}
    </span>
  );
}

const phases: Record<Phase, [Status, string]> = {
  finished: ["finished", "Finished"],
  live: ["live", "In progress"],
  upcoming: ["live", "Upcoming"],
  tba: ["pending", "Date TBA"],
  postponed: ["pending", "Postponed"],
  cancelled: ["cancelled", "Cancelled"],
};

/** where a round stands right now, the way the site shows it */
export function PhaseChip({ phase }: { phase: Phase }) {
  return <StatusChip status={phases[phase][0]}>{phases[phase][1]}</StatusChip>;
}
