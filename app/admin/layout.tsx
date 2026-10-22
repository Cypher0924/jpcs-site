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
  // the tower's next-round readout. same numbering as the site: one after the last event
  const db = await sessionClient();
  const [{ data: next }, { count }] = await Promise.all([
    db.from("next_event").select("starts_at").single(),
    db.from("events").select("id", { count: "exact", head: true }),
  ]);
  return (
    <AdminSidebar
      email={staff.email}
      role={staff.role}
      next={next ? { round: (count ?? 0) + 1, startsAt: next.starts_at } : null}
    />
  );
}
