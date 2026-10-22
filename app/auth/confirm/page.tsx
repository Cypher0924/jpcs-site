import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/admin/shell";
import { SetPasswordForm } from "./set-password-form";

export const metadata: Metadata = { title: "Set password · JPCS-TSU", robots: { index: false } };

export default function ConfirmPage({ searchParams }: PageProps<"/auth/confirm">) {
  return (
    <AuthCard title="Set your password" sub="Choose a password for the JPCS-TSU site admin.">
      {/* the link's query string is request data, so it sits behind Suspense */}
      <Suspense fallback={null}>
        <LinkForm searchParams={searchParams} />
      </Suspense>
    </AuthCard>
  );
}

async function LinkForm({ searchParams }: { searchParams: PageProps<"/auth/confirm">["searchParams"] }) {
  const { token_hash, code, type } = await searchParams;
  if (typeof code === "string") return <SetPasswordForm code={code} type="recovery" />;
  if (typeof token_hash !== "string" || (type !== "invite" && type !== "recovery")) {
    return <p className="text-sm text-signal">This link is incomplete. Ask an admin for a new one.</p>;
  }
  return <SetPasswordForm tokenHash={token_hash} type={type} />;
}
