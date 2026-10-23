import Link from "next/link";
import { signOut } from "@/app/admin/account/actions";
import type { Role } from "@/lib/auth";
import { menuItemClass } from "./styles";

/** who's signed in, with Settings, View site and Sign out. a native popover, so it needs no script to open */
export function AccountMenu({ id, email, role }: { id: string; email: string; role: Role }) {
  return (
    <>
      <button
        type="button"
        popoverTarget={id}
        aria-label={`Account menu for ${email}`}
        title={email}
        className="grid size-10 shrink-0 place-items-center border border-line text-ink transition-colors hover:border-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
      >
        <svg aria-hidden viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
      </button>
      {/* opens under the top-right corner, where both the desktop bar and the phone bar keep this button */}
      <div
        id={id}
        popover="auto"
        className="fixed inset-auto top-16 right-3 m-0 w-64 border border-line-strong bg-surface py-1 text-ink shadow-[0_12px_32px_rgb(0_0_0/0.25)] md:right-6"
      >
        <div className="border-b border-line px-3 pt-2 pb-3">
          <p className="truncate text-sm font-semibold" title={email}>
            {email}
          </p>
          <p className="type-data mt-1 inline-block border border-line px-1.5 text-xs tracking-wide text-ink-muted uppercase">{role}</p>
        </div>
        <div className="py-1">
          <Link href="/admin/account" className={menuItemClass}>
            Settings
          </Link>
          <Link href="/" className={menuItemClass}>
            View site
            <svg aria-hidden viewBox="0 0 16 16" className="ml-auto size-3.5 text-ink-muted" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 3h7v7M13 3 4 12" />
            </svg>
          </Link>
          <form action={signOut}>
            <button type="submit" className={menuItemClass}>
              Sign out
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
