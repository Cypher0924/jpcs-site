import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActionForm, Field, Input, SubmitButton } from "@/components/admin/form";
import { MoveButtons } from "@/components/admin/move-buttons";
import { ItemFooter, PageHeader, Panel } from "@/components/admin/shell";
import { getEditors, lastEdited } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { deleteStat, saveContact, saveStat, saveStats } from "./actions";

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
      <PageHeader code="STA" title="Stats and contact" sub="The numbers strip on the homepage, and the links used in Join and the footer." />
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Panel title="Stats strip" meta={`${stats?.length ?? 0} stats`}>
          <p className="mb-4 text-sm text-ink-muted">Leave a value empty to show 000 until the real number is known.</p>
          <ul className="flex flex-col gap-3">
            {(stats ?? []).map((s, i, all) => (
              <li key={s.id} className="bg-surface-2 p-3">
                {/* fields join the "Save stats" form below, so the move and delete menu can keep its own forms */}
                <div className="grid gap-3 sm:grid-cols-[1fr_7rem_6rem]">
                  <input type="hidden" name="id" value={s.id} form="stats-form" />
                  <Field label="Label">
                    <Input name="label" defaultValue={s.label} required form="stats-form" />
                  </Field>
                  <Field label="Value">
                    <Input name="value" type="number" min={0} step={1} defaultValue={s.value ?? ""} form="stats-form" />
                  </Field>
                  <Field label="Unit">
                    <Input name="unit" defaultValue={s.unit ?? ""} placeholder="e.g. yrs" form="stats-form" />
                  </Field>
                </div>
                <ItemFooter edited={lastEdited(s, editors)} name={s.label}>
                  <MoveButtons menu table="stats" id={s.id} first={i === 0} last={i === all.length - 1} />
                  <form action={deleteStat}>
                    <input type="hidden" name="id" value={s.id} />
                    <ConfirmButton message={`Delete the "${s.label}" stat?`} menu>
                      Delete stat
                    </ConfirmButton>
                  </form>
                </ItemFooter>
              </li>
            ))}
          </ul>
          {!!stats?.length && (
            <ActionForm id="stats-form" action={saveStats} className="mt-4 flex flex-col gap-3">
              <div>
                <SubmitButton>Save stats</SubmitButton>
              </div>
            </ActionForm>
          )}
          <div className="mt-6">
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
              <SubmitButton variant="secondary">Add stat</SubmitButton>
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
