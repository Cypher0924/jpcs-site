import type { Metadata } from "next";
import { linkClass } from "@/components/admin/styles";
import Link from "next/link";
import { AuthCard } from "@/components/admin/shell";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in · JPCS-TSU", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthCard title="Sign in" sub="For JPCS-TSU officers who update the website.">
      <LoginForm />
      <p className="mt-4 text-sm">
        <Link href="/forgot-password" className={linkClass}>
          Forgot your password?
        </Link>
      </p>
    </AuthCard>
  );
}
