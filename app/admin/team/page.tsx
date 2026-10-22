import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActionForm, Field, Input, SubmitButton } from "@/components/admin/form";
import { PageHeader, Panel } from "@/components/admin/shell";
import { inputClass } from "@/components/admin/styles";
import { requireAdmin } from "@/lib/auth";
import { adminClient } from "@/lib/supabase/admin";
import { sessionClient } from "@/lib/supabase/server";
import { changeRole, inviteMember, removeMember, resetLink } from "./actions";

export const metadata = { title: "Team" };
export const instant = false;

const date = (iso: string) =>
  new Date(iso).toLocaleString("en-PH", { timeZone: "Asia/Manila", month: "short", day: "numeric", year: "numeric" });

export default async function TeamPage() {
  const me = await requireAdmin();
  const [{ data: team }, { data: auth }] = await Promise.all([
    (await sessionClient()).from("profiles").select("id, email, role, created_at").order("created_at"),
    // sign-in info only exists on the auth side
    adminClient().auth.admin.listUsers({ perPage: 1000 }),
  ]);
  const lastSignIn = new Map(auth.users.map((u) => [u.id, u.last_sign_in_at]));
  const roleSelect = `${inputClass.replace("w-full ", "")} h-10 w-32`;

  return (
    <>
      <PageHeader title="Team" sub="Who can sign in to the admin. Editors change content, admins also manage the team and see the audit log." />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <Panel title={`Members (${team?.length ?? 0})`}>
          <ul className="flex flex-col divide-y divide-line">
            {(team ?? []).map((m) => {
              const seen = lastSignIn.get(m.id);
              const self = m.id === me.id;
              return (
                <li key={m.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-semibold break-all">
                      {m.email} {self && <span className="text-xs font-normal text-ink-muted">(you)</span>}
                    </span>
                    <span className="text-xs text-ink-muted">
                      {seen ? `Last signed in ${date(seen)}` : "Invite not used yet"} · added {date(m.created_at)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-start gap-2">
                    <ActionForm action={changeRole} className="flex flex-wrap items-start gap-2">
                      <input type="hidden" name="id" value={m.id} />
                      <select name="role" defaultValue={m.role} aria-label={`Role for ${m.email}`} className={roleSelect} disabled={self}>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                      {!self && <SubmitButton variant="secondary">Save role</SubmitButton>}
                    </ActionForm>
                    <ActionForm action={resetLink} className="flex flex-col gap-2">
                      <input type="hidden" name="email" value={m.email} />
                      <SubmitButton variant="secondary" pendingText="Making link…">
                        {seen ? "Password reset link" : "New invite link"}
                      </SubmitButton>
                    </ActionForm>
                    {!self && (
                      <ActionForm action={removeMember} className="flex flex-col gap-2">
                        <input type="hidden" name="id" value={m.id} />
                        <ConfirmButton message={`Remove ${m.email}? They won't be able to sign in anymore.`}>Remove</ConfirmButton>
                      </ActionForm>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Invite someone">
          <ActionForm action={inviteMember}>
            <Field label="Email">
              <Input name="email" type="email" required autoComplete="off" />
            </Field>
            <Field label="Role" hint="Most officers should be editors.">
              <select name="role" defaultValue="editor" className={`${inputClass} h-10`}>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
            </Field>
            <p className="text-xs text-ink-muted">
              You&apos;ll get a link to send them (Messenger works). They open it, set a password, and they&apos;re in.
            </p>
            <div>
              <SubmitButton pendingText="Creating invite…">Create invite link</SubmitButton>
            </div>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
