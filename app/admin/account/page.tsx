import { buttonClass } from "@/components/admin/form";
import { PageHeader, Panel } from "@/components/admin/shell";
import { requireStaff } from "@/lib/auth";
import { signOut } from "./actions";
import { PasswordForm } from "./password-form";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const staff = await requireStaff();
  return (
    <>
      <PageHeader title="Account" sub={`${staff.email} · ${staff.role}`} />
      <div className="grid max-w-xl gap-6">
        <Panel title="Change password">
          <PasswordForm />
        </Panel>
        <Panel title="Sign out">
          <form action={signOut}>
            <button type="submit" className={buttonClass("secondary")}>
              Sign out
            </button>
          </form>
        </Panel>
      </div>
    </>
  );
}
