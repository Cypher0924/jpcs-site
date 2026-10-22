import Link from "next/link";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActionForm, Field, Input, SubmitButton, Textarea } from "@/components/admin/form";
import { ImageInput } from "@/components/admin/image-input";
import { MoveButtons } from "@/components/admin/move-buttons";
import { PageHeader, Panel } from "@/components/admin/shell";
import { getEditors, lastEdited } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { createYear, deleteGroup, deleteOfficer, deleteYear, makeCurrent, saveGroup, saveOfficer } from "./actions";

export const metadata = { title: "Officers" };
export const instant = false;

type Editors = Map<string, string>;
type Officer = {
  id: number;
  group_id: number;
  name: string;
  role: string;
  slug: string;
  photo: string | null;
  quote: string | null;
  is_adviser: boolean;
  updated_at: string;
  updated_by: string | null;
};

export default async function OfficersPage({ searchParams }: PageProps<"/admin/officers">) {
  await requireStaff();
  const { year } = await searchParams;
  const db = await sessionClient();
  const { data: yearRows } = await db.from("school_years").select("*").order("label", { ascending: false });
  const years = yearRows ?? [];
  const shown = years.find((y) => String(y.id) === year) ?? years.find((y) => y.is_current) ?? years[0];

  const header = <PageHeader title="Officers" sub="Groups and officers for each school year. Only the current year shows on the site." />;
  if (!shown) {
    return (
      <>
        {header}
        <Panel title="Start a new school year">
          <NewYear />
        </Panel>
      </>
    );
  }

  const [{ data: groupRows }, { data: officerRows }, editors] = await Promise.all([
    db.from("officer_groups").select("*").eq("school_year_id", shown.id).order("sort").order("id"),
    db.from("officers").select("*").eq("school_year_id", shown.id).order("sort").order("id"),
    getEditors(),
  ]);
  const groups = groupRows ?? [];
  const officers = (officerRows ?? []) as Officer[];

  return (
    <>
      {header}

      <nav aria-label="School years" className="mb-4 flex flex-wrap gap-2">
        {years.map((y) => (
          <Link
            key={y.id}
            href={`/admin/officers?year=${y.id}`}
            aria-current={y.id === shown.id ? "page" : undefined}
            className={`border px-3 py-1.5 text-sm font-semibold ${
              y.id === shown.id ? "border-accent bg-surface-2 text-ink" : "border-line text-ink-muted hover:text-ink"
            }`}
          >
            {y.label}
            {y.is_current && <span className="ml-2 text-xs font-normal text-accent-text">Current</span>}
          </Link>
        ))}
      </nav>

      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <Panel title={`School year ${shown.label}`}>
          <p className="text-sm text-ink-muted">
            {shown.is_current ? "Current, shown on the site." : "Not shown on the site."} {officers.length} officers in {groups.length} groups.
          </p>
          <div className="mt-3 flex flex-wrap items-start gap-3">
            {!shown.is_current && (
              <ActionForm action={makeCurrent} className="flex flex-col gap-2">
                <input type="hidden" name="id" value={shown.id} />
                <SubmitButton>Make this the current year</SubmitButton>
              </ActionForm>
            )}
            {!shown.is_current && officers.length === 0 && (
              <ActionForm action={deleteYear} className="flex flex-col gap-2">
                <input type="hidden" name="id" value={shown.id} />
                <ConfirmButton message={`Delete the ${shown.label} school year and its groups?`}>Delete year</ConfirmButton>
              </ActionForm>
            )}
          </div>
        </Panel>

        <Panel title="Start a new school year">
          <NewYear copyFrom={shown} />
        </Panel>
      </div>

      <div className="flex flex-col gap-6">
        {groups.map((g, i) => {
          const members = officers.filter((o) => o.group_id === g.id);
          return (
            <Panel key={g.id}>
              <ActionForm action={saveGroup} className="grid gap-3 md:grid-cols-[1fr_1fr_10rem_auto] md:items-end">
                <input type="hidden" name="id" value={g.id} />
                <Field label="Group title">
                  <Input name="title" defaultValue={g.title} required />
                </Field>
                <Field label="Label" hint={`Shown on cards as "${g.label} · ${shown.label}"`}>
                  <Input name="label" defaultValue={g.label} required />
                </Field>
                <Field label="Row breaks" hint="Ends a desktop row after these positions, counting from 0.">
                  <Input name="breaks" defaultValue={(g.breaks as number[]).join(", ")} placeholder="1, 3" />
                </Field>
                <SubmitButton>Save group</SubmitButton>
              </ActionForm>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-ink-muted">{lastEdited(g, editors)}</span>
                <div className="flex items-start gap-2">
                  <MoveButtons table="officer_groups" id={g.id} first={i === 0} last={i === groups.length - 1} />
                  {members.length === 0 && (
                    <ActionForm action={deleteGroup} className="flex flex-col gap-1">
                      <input type="hidden" name="id" value={g.id} />
                      <ConfirmButton message={`Delete the "${g.title}" group?`} small>
                        Delete group
                      </ConfirmButton>
                    </ActionForm>
                  )}
                </div>
              </div>

              <ul className="mt-4 flex flex-col border-t border-line">
                {members.map((o, j) => (
                  <OfficerRow key={o.id} o={o} groupId={g.id} first={j === 0} last={j === members.length - 1} editors={editors} />
                ))}
                {members.length === 0 && <li className="py-3 text-sm text-ink-muted">No officers in this group.</li>}
              </ul>

              <details className="mt-2 border border-line">
                <summary className="cursor-pointer px-3 py-2 text-sm font-semibold">Add officer to {g.title}</summary>
                <div className="border-t border-line p-3">
                  <OfficerForm groupId={g.id} />
                </div>
              </details>
            </Panel>
          );
        })}
      </div>

      <div className="mt-6">
        <Panel title="Add group">
          <ActionForm action={saveGroup} className="grid gap-3 md:grid-cols-[1fr_1fr_10rem_auto] md:items-end">
            <input type="hidden" name="school_year_id" value={shown.id} />
            <Field label="Group title">
              <Input name="title" placeholder="Executive Board" required />
            </Field>
            <Field label="Label">
              <Input name="label" placeholder="Newly elected" required />
            </Field>
            <Field label="Row breaks">
              <Input name="breaks" placeholder="1, 3" />
            </Field>
            <SubmitButton>Add group</SubmitButton>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}

function NewYear({ copyFrom }: { copyFrom?: { id: number; label: string } }) {
  return (
    <ActionForm action={createYear}>
      {copyFrom && <input type="hidden" name="copy_from" value={copyFrom.id} />}
      <Field label="School year" hint="Format 2027-2028. It does not become the current year automatically.">
        <Input name="label" placeholder="2027-2028" pattern="\d{4}-\d{4}" required />
      </Field>
      {copyFrom && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="copy" defaultChecked />
          Copy the groups from {copyFrom.label}
        </label>
      )}
      <div>
        <SubmitButton>Start school year</SubmitButton>
      </div>
    </ActionForm>
  );
}

function OfficerRow({ o, groupId, first, last, editors }: { o: Officer; groupId: number; first: boolean; last: boolean; editors: Editors }) {
  return (
    <li className="border-b border-line py-2">
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center overflow-hidden border border-line bg-surface-2">
          {o.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- small admin thumbnail from the media bucket
            <img src={o.photo} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-[10px] text-ink-muted">None</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {o.name}
            {o.is_adviser && <span className="ml-2 text-xs font-normal text-accent-text">Adviser</span>}
          </p>
          <p className="truncate text-xs text-ink-muted">{o.role}</p>
        </div>
        <MoveButtons table="officers" id={o.id} first={first} last={last} />
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-sm font-semibold text-accent-text">Edit</summary>
        <div className="mt-3 border border-line p-3">
          <OfficerForm groupId={groupId} o={o} />
          <div className="mt-3 flex flex-wrap items-start justify-between gap-3 border-t border-line pt-3">
            <span className="text-xs text-ink-muted">{lastEdited(o, editors)}</span>
            <ActionForm action={deleteOfficer} className="flex flex-col gap-1">
              <input type="hidden" name="id" value={o.id} />
              <ConfirmButton message={`Delete ${o.name}?`} small>
                Delete
              </ConfirmButton>
            </ActionForm>
          </div>
        </div>
      </details>
    </li>
  );
}

function OfficerForm({ groupId, o }: { groupId: number; o?: Officer }) {
  return (
    <ActionForm action={saveOfficer}>
      {o && <input type="hidden" name="id" value={o.id} />}
      <input type="hidden" name="group_id" value={groupId} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Name">
          <Input name="name" defaultValue={o?.name} required />
        </Field>
        <Field label="Role">
          <Input name="role" defaultValue={o?.role} required />
        </Field>
        <Field label="Slug" hint="Optional. Made from the name when empty.">
          <Input name="slug" defaultValue={o?.slug} />
        </Field>
      </div>
      <ImageInput name="photo" label="Photo" current={o?.photo} square />
      <Field label="Quote">
        <Textarea name="quote" rows={2} defaultValue={o?.quote ?? ""} />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_adviser" defaultChecked={o?.is_adviser} />
        Adviser (shows as TP instead of a race number)
      </label>
      <div>
        <SubmitButton>{o ? "Save officer" : "Add officer"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
