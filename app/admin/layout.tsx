import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { getStaff } from "@/lib/auth";

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
      <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
    </div>
  );
}

async function SidebarForUser() {
  const staff = await getStaff();
  return <AdminSidebar email={staff?.email ?? null} role={staff?.role ?? null} />;
}
