import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActionForm, Field, Input, SubmitButton } from "@/components/admin/form";
import { MoveButtons } from "@/components/admin/move-buttons";
import { PageHeader, Panel } from "@/components/admin/shell";
import { getEditors, lastEdited } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { deleteStat, saveContact, saveStat } from "./actions";

export const metadata = { title: "Stats and contact" };
export const instant = false;

export default async function SettingsPage() {
  await requireStaff();
  const db = await sessionClient();
  const [{ data: stats }, { data: contact }, editors] = await Promise.all([
    db.from("stats").select("*").order("sort").order("id"),
    db.from("contact").select("*").single(),
    getEditors(),
  ]);

  return (
    <>
      <PageHeader title="Stats and contact" sub="The numbers strip on the homepage, and the links used in Join and the footer." />
      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Stats strip">
          <p className="mb-4 text-sm text-ink-muted">Leave a value empty to show 000 until the real number is known.</p>
          <ul className="flex flex-col gap-3">
            {(stats ?? []).map((s, i, all) => (
              <li key={s.id} className="border border-line p-3">
                <ActionForm action={saveStat} className="grid gap-3 sm:grid-cols-[1fr_7rem_6rem_auto] sm:items-end">
                  <input type="hidden" name="id" value={s.id} />
                  <Field label="Label">
                    <Input name="label" defaultValue={s.label} required />
                  </Field>
                  <Field label="Value">
                    <Input name="value" type="number" min={0} step={1} defaultValue={s.value ?? ""} />
                  </Field>
                  <Field label="Unit">
                    <Input name="unit" defaultValue={s.unit ?? ""} placeholder="e.g. yrs" />
                  </Field>
                  <SubmitButton>Save</SubmitButton>
                </ActionForm>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <span className="text-xs text-ink-muted">{lastEdited(s, editors)}</span>
                  <div className="flex gap-2">
                    <MoveButtons table="stats" id={s.id} first={i === 0} last={i === all.length - 1} />
                    <form action={deleteStat}>
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmButton message={`Delete the "${s.label}" stat?`} small>
                        Delete
                      </ConfirmButton>
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-line pt-4">
            <h3 className="mb-3 text-sm font-semibold">Add a stat</h3>
            <ActionForm action={saveStat} className="grid gap-3 sm:grid-cols-[1fr_7rem_6rem_auto] sm:items-end">
              <Field label="Label">
                <Input name="label" required />
              </Field>
              <Field label="Value">
                <Input name="value" type="number" min={0} step={1} />
              </Field>
              <Field label="Unit">
                <Input name="unit" />
              </Field>
              <SubmitButton>Add</SubmitButton>
            </ActionForm>
          </div>
        </Panel>

        <Panel title="Contact links">
          {contact && (
            <ActionForm action={saveContact}>
              <Field label="Email">
                <Input name="email" type="email" defaultValue={contact.email} required />
              </Field>
              <Field label="Facebook page link">
                <Input name="facebook" type="url" defaultValue={contact.facebook} required />
              </Field>
              <Field label="Facebook handle" hint='Shown as "fb.com" + this, e.g. /TSUJPCS'>
                <Input name="handle" defaultValue={contact.handle} required />
              </Field>
              <Field label="Messenger link">
                <Input name="messenger" type="url" defaultValue={contact.messenger} required />
              </Field>
              <Field label="Membership form link" hint='The "Box, box: register now" button'>
                <Input name="registration" type="url" defaultValue={contact.registration} required />
              </Field>
              <p className="text-xs text-ink-muted">{lastEdited(contact, editors)}</p>
              <div>
                <SubmitButton>Save contact links</SubmitButton>
              </div>
            </ActionForm>
          )}
        </Panel>
      </div>
    </>
  );
}
