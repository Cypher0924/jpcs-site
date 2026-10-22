import { ConfirmButton } from "@/components/admin/confirm-button";
import { DatePicker } from "@/components/admin/date-picker";
import { ActionForm, Field, Input, SubmitButton, Textarea } from "@/components/admin/form";
import { ImageInput } from "@/components/admin/image-input";
import { PageHeader, Panel } from "@/components/admin/shell";
import { StatusChip } from "@/components/admin/status";
import { checkboxClass } from "@/components/admin/styles";
import { getEditors, lastEdited } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { finishRound, saveNextRound } from "./actions";

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

  const hasRound = Boolean(e && !e.tba && e.title);

  return (
    <>
      <PageHeader
        code="NXT"
        title="Next round"
        sub="The red card in Race calendar and the badge in the hero. Its round number is the one after the last event."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,42rem)_22rem]">
        <Panel
          title="Upcoming round"
          meta={
            !e || e.tba ? (
              <StatusChip status="pending">To be announced</StatusChip>
            ) : e.starts_at ? (
              <StatusChip status="live">Countdown on</StatusChip>
            ) : (
              <StatusChip status="pending">In progress</StatusChip>
            )
          }
        >
          {e && (
            <ActionForm action={saveNextRound}>
              <label className="flex items-start gap-3 border border-line bg-canvas p-3 text-sm">
                <input type="checkbox" name="tba" defaultChecked={e.tba} className={`${checkboxClass} mt-0.5`} />
                <span>
                  <span className="block font-semibold">No upcoming round yet</span>
                  <span className="block text-xs text-ink-muted">The site shows “To be announced” instead of a countdown. Untick it once you fill in the next round.</span>
                </span>
              </label>
              <Field label="Title">
                <Input name="title" defaultValue={e.title} />
              </Field>
              <DatePicker
                name="starts_at"
                label="Starts at (Manila time)"
                hint="Shows a live countdown, then “In progress” once it starts. Clear it to show “In progress” now."
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

        <Panel title="Round finished?">
          <p className="text-sm text-ink-muted">
            Moves this round to Events as a finished round with its title, date, venue, blurb and photo, then opens it so you can
            add the recap photos. This page then shows “To be announced” until you set the next round.
          </p>
          <div className="mt-4">
            {hasRound ? (
              <ActionForm action={finishRound} className="flex flex-col gap-3">
                <ConfirmButton variant="primary" message={`Move "${e!.title}" to Events as a finished round?`}>
                  Finish round
                </ConfirmButton>
              </ActionForm>
            ) : (
              <p className="text-sm font-semibold">There&apos;s no round to finish right now.</p>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
