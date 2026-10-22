import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: { template: "%s · Admin · JPCS-TSU", default: "Admin · JPCS-TSU" },
  robots: { index: false },
};

// static shell. the user (cookies) is read inside Suspense, and each page checks access itself
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-canvas text-ink md:grid md:grid-cols-[15rem_minmax(0,1fr)]">
      <Suspense fallback={<AdminSidebar email={null} role={null} />}>
        <SidebarForUser />
      </Suspense>
      <main className="mx-auto w-full max-w-[80rem] px-4 py-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}

async function SidebarForUser() {
  const staff = await getStaff();
  if (!staff) return <AdminSidebar email={null} role={null} />;
  // the tower's next-round readout, numbered like the site: by date, cancelled rounds left out
  const { data } = await (await sessionClient())
    .from("events")
    .select("id, starts_at, ends_at, status")
    .neq("status", "cancelled")
    .order("starts_at", { nullsFirst: false })
    .order("id");
  const rounds = (data ?? []).map((e, i) => ({ id: e.id as number, round: i + 1, startsAt: e.starts_at, endsAt: e.ends_at, status: e.status }));
  return <AdminSidebar email={staff.email} role={staff.role} rounds={rounds} />;
}
