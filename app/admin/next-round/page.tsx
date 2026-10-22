import { DatePicker } from "@/components/admin/date-picker";
import { ActionForm, Field, Input, SubmitButton, Textarea } from "@/components/admin/form";
import { ImageInput } from "@/components/admin/image-input";
import { PageHeader, Panel } from "@/components/admin/shell";
import { getEditors, lastEdited } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { saveNextRound } from "./actions";

export const metadata = { title: "Next round" };
export const instant = false;

// stored in UTC, edited as Manila time
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("sv-SE", { timeZone: "Asia/Manila" }).replace(" ", "T").slice(0, 16);
}

export default async function NextRoundPage() {
  await requireStaff();
  const [{ data: e }, editors] = await Promise.all([
    (await sessionClient()).from("next_event").select("*").single(),
    getEditors(),
  ]);

  return (
    <>
      <PageHeader
        code="NXT"
        title="Next round"
        sub="The red card in Race calendar and the badge in the hero. Its round number is the one after the last event."
      />
      <div className="max-w-2xl">
        <Panel>
          {e && (
            <ActionForm action={saveNextRound}>
              <Field label="Title">
                <Input name="title" defaultValue={e.title} required />
              </Field>
              <DatePicker
                name="starts_at"
                label="Starts at (Manila time)"
                hint="Shows a live countdown. Clear it to show “In progress” instead."
                emptyText="In progress (no countdown)"
                defaultValue={toLocalInput(e.starts_at)}
                withTime
              />
              <Field label="Venue or short line" hint="Shown under the title, e.g. Open to all CCS students.">
                <Input name="venue" defaultValue={e.venue} />
              </Field>
              <Field label="Blurb">
                <Textarea name="blurb" rows={3} defaultValue={e.blurb} />
              </Field>
              <ImageInput name="photo" label="Photo or pubmat" current={e.photo} />
              <Field label="Photo caption" hint="e.g. Official pubmat · JPCS-TSU">
                <Input name="photo_caption" defaultValue={e.photo_caption ?? ""} />
              </Field>
              <p className="text-xs text-ink-muted">{lastEdited(e, editors)}</p>
              <div>
                <SubmitButton>Save next round</SubmitButton>
              </div>
            </ActionForm>
          )}
        </Panel>
      </div>
    </>
  );
}
