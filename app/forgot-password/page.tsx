import type { Metadata } from "next";
import Link from "next/link";
import { AuthCard } from "@/components/admin/shell";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Forgot password · JPCS-TSU", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <AuthCard title="Forgot password" sub="We'll email you a link to set a new password.">
      <ForgotForm />
      <p className="mt-4 text-sm">
        <Link href="/login" className="text-accent-text hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
