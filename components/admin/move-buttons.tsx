import { moveRow } from "@/app/admin/actions";

/** up and down controls for any list with a sort column */
export function MoveButtons({ table, id, first, last }: { table: string; id: number; first: boolean; last: boolean }) {
  const btn =
    "grid size-8 place-items-center border border-line text-ink-muted transition-colors hover:border-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-30";
  return (
    <form action={moveRow} className="flex gap-1">
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" name="dir" value="up" disabled={first} className={btn} aria-label="Move up">
        <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m4 10 4-4 4 4" />
        </svg>
      </button>
      <button type="submit" name="dir" value="down" disabled={last} className={btn} aria-label="Move down">
        <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m4 6 4 4 4-4" />
        </svg>
      </button>
    </form>
  );
}
