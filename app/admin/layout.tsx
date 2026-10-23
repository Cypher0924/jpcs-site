import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountMenu } from "@/components/admin/account-menu";
import { CloseMenusOnNavigate } from "@/components/admin/close-menus";
import { CollapseButton } from "@/components/admin/collapse-button";
import { AdminSidebar } from "@/components/admin/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { getStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { template: "%s · Admin · JPCS-TSU", default: "Admin · JPCS-TSU" },
  robots: { index: false },
};

// static shell. the user (cookies) is read inside Suspense, and each page checks access itself
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-canvas text-ink md:grid md:grid-cols-[15rem_minmax(0,1fr)] md:collapsed:grid-cols-[5.5rem_minmax(0,1fr)]">
      <Suspense fallback={<AdminSidebar role={null} />}>
        <SidebarForUser />
      </Suspense>
      <div className="min-w-0">
        {/* desktop top bar. phones get the same controls in the tower's own bar */}
        <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-line bg-canvas px-6 md:flex">
          <CollapseButton />
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Suspense fallback={<span className="size-10" />}>
              <AccountForUser id="account-menu" />
            </Suspense>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[80rem] px-4 py-6 md:px-10 md:py-10">{children}</main>
      </div>
      <CloseMenusOnNavigate />
    </div>
  );
}

async function AccountForUser({ id }: { id: string }) {
  const staff = await getStaff();
  return staff ? <AccountMenu id={id} email={staff.email} role={staff.role} /> : null;
}

async function SidebarForUser() {
  const staff = await getStaff();
  if (!staff) return <AdminSidebar role={null} />;
  // the tower's next-round readout, numbered like the site: by date, cancelled rounds left out
  const { data } = await (await sessionClient())
    .from("events")
    .select("id, starts_at, ends_at, status")
    .neq("status", "cancelled")
    .order("starts_at", { nullsFirst: false })
    .order("id");
  const rounds = (data ?? []).map((e, i) => ({ id: e.id as number, round: i + 1, startsAt: e.starts_at, endsAt: e.ends_at, status: e.status }));
  return (
    <AdminSidebar
      role={staff.role}
      rounds={rounds}
      account={<AccountMenu id="account-menu-phone" email={staff.email} role={staff.role} />}
    />
  );
}
