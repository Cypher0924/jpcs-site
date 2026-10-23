import type { ReactNode } from "react";
import { moveRow } from "@/app/admin/actions";
import { menuItemClass } from "./styles";

const up = <path d="m4 10 4-4 4 4" />;
const down = <path d="m4 6 4 4 4-4" />;
const icon = (path: ReactNode, cls: string) => (
  <svg aria-hidden viewBox="0 0 16 16" className={cls} fill="none" stroke="currentColor" strokeWidth="2">
    {path}
  </svg>
);

/** up and down controls for any list with a sort column. menu: as rows inside the "⋯" item menu */
export function MoveButtons({ table, id, first, last, menu }: { table: string; id: number; first: boolean; last: boolean; menu?: boolean }) {
  const btn =
    "grid size-8 place-items-center border border-line text-ink-muted transition-colors hover:border-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-30";
  return (
    <form action={moveRow} className={menu ? "flex flex-col" : "flex gap-1"} data-close-menu={menu || undefined}>
      <input type="hidden" name="table" value={table} />
      <input type="hidden" name="id" value={id} />
      <button type="submit" name="dir" value="up" disabled={first} className={menu ? menuItemClass : btn} aria-label={menu ? undefined : "Move up"}>
        {icon(up, menu ? "size-4 text-ink-muted" : "size-4")}
        {menu && "Move up"}
      </button>
      <button type="submit" name="dir" value="down" disabled={last} className={menu ? menuItemClass : btn} aria-label={menu ? undefined : "Move down"}>
        {icon(down, menu ? "size-4 text-ink-muted" : "size-4")}
        {menu && "Move down"}
      </button>
    </form>
  );
}
