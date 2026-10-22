import Link from "next/link";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActionForm, Field, Input, SubmitButton, Textarea } from "@/components/admin/form";
import { ImageInput } from "@/components/admin/image-input";
import { MoveButtons } from "@/components/admin/move-buttons";
import { ItemFooter, PageHeader, Panel } from "@/components/admin/shell";
import { StatusChip } from "@/components/admin/status";
import { checkboxClass } from "@/components/admin/styles";
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

  const header = <PageHeader code="OFF" title="Officers" sub="Groups and officers for each school year. Only the current year shows on the site." />;
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

      <nav aria-label="School years" className="mb-6 flex flex-wrap gap-x-1 border-b border-line">
        {years.map((y) => (
          <Link
            key={y.id}
            href={`/admin/officers?year=${y.id}`}
            aria-current={y.id === shown.id ? "page" : undefined}
            className={`-mb-px flex h-11 items-center gap-2 border-b-2 px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${
              y.id === shown.id ? "border-accent font-semibold text-ink" : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            <span className="type-data">{y.label}</span>
            {y.is_current && <span aria-hidden className="size-1.5 rounded-full bg-live" />}
            {y.is_current && <span className="sr-only">(current)</span>}
          </Link>
        ))}
      </nav>

      <div className="mb-6 grid items-start gap-6 xl:grid-cols-2">
        <Panel
          title={`School year ${shown.label}`}
          meta={shown.is_current ? <StatusChip status="live">On the site</StatusChip> : <StatusChip status="pending">Not shown</StatusChip>}
        >
          <p className="text-sm text-ink-muted">
            {officers.length} {officers.length === 1 ? "officer" : "officers"} in {groups.length} {groups.length === 1 ? "group" : "groups"}.{" "}
            {shown.is_current ? "This is the lineup on the site now." : "Older years show under Past seasons on the homepage."}
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
            <Panel key={g.id} title={g.title} meta={`${members.length} ${members.length === 1 ? "officer" : "officers"}`}>
              <ActionForm action={saveGroup} className="grid gap-3 md:grid-cols-[1fr_1fr_10rem_auto] md:items-start">
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
                <div className="md:pt-[1.625rem]">
                  <SubmitButton>Save group</SubmitButton>
                </div>
              </ActionForm>
              <ItemFooter edited={lastEdited(g, editors)}>
                <MoveButtons table="officer_groups" id={g.id} first={i === 0} last={i === groups.length - 1} />
                {members.length === 0 && (
                  <ActionForm action={deleteGroup} className="flex flex-col gap-1">
                    <input type="hidden" name="id" value={g.id} />
                    <ConfirmButton message={`Delete the "${g.title}" group?`} small>
                      Delete group
                    </ConfirmButton>
                  </ActionForm>
                )}
              </ItemFooter>

              <ul className="mt-4 flex flex-col border-t border-line">
                {members.map((o, j) => (
                  <OfficerRow key={o.id} o={o} groupId={g.id} first={j === 0} last={j === members.length - 1} editors={editors} />
                ))}
                {members.length === 0 && <li className="py-3 text-sm text-ink-muted">No officers in this group.</li>}
              </ul>

              <details className="mt-3 border border-line bg-canvas">
                <summary className="cursor-pointer px-3 py-3 text-sm font-semibold">Add officer to {g.title}</summary>
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
          <ActionForm action={saveGroup} className="grid gap-3 md:grid-cols-[1fr_1fr_10rem_auto] md:items-start">
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
            <div className="md:pt-[1.625rem]">
              <SubmitButton>Add group</SubmitButton>
            </div>
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
          <input type="checkbox" name="copy" defaultChecked className={checkboxClass} />
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
            {o.is_adviser && <span className="ml-2 border border-line px-1.5 text-[0.6875rem] font-normal text-ink-muted">Adviser</span>}
          </p>
          <p className="truncate text-xs text-ink-muted">{o.role}</p>
        </div>
        <MoveButtons table="officers" id={o.id} first={first} last={last} />
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer py-1 text-sm font-semibold">Edit</summary>
        <div className="mt-3 border border-line bg-canvas p-3">
          <OfficerForm groupId={groupId} o={o} />
          <ItemFooter edited={lastEdited(o, editors)}>
            <ActionForm action={deleteOfficer} className="flex flex-col gap-1">
              <input type="hidden" name="id" value={o.id} />
              <ConfirmButton message={`Delete ${o.name}?`} small>
                Delete
              </ConfirmButton>
            </ActionForm>
          </ItemFooter>
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
        <input type="checkbox" name="is_adviser" defaultChecked={o?.is_adviser} className={checkboxClass} />
        Adviser (shows as TP instead of a race number)
      </label>
      <div>
        <SubmitButton>{o ? "Save officer" : "Add officer"}</SubmitButton>
      </div>
    </ActionForm>
  );
}
