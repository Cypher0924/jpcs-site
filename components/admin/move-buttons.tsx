import { moveRow } from "@/app/admin/actions";

/** ↑ ↓ controls for any list with a sort column */
export function MoveButtons({ table, id, first, last }: { table: string; id: number; first: boolean; last: boolean }) {
  const btn =
    "grid size-8 place-items-center border border-line text-sm text-ink-muted hover:border-line-strong hover:text-ink disabled:opacity-30";
  return (
    <form action={moveRow} className="flex gap-1">
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" name="dir" value="up" disabled={first} className={btn} aria-label="Move up">
        ↑
      </button>
      <button type="submit" name="dir" value="down" disabled={last} className={btn} aria-label="Move down">
        ↓
      </button>
    </form>
  );
}
