import { DatePicker } from "@/components/admin/date-picker";
import { Field, Input, Textarea } from "@/components/admin/form";
import { ImageInput } from "@/components/admin/image-input";
import { checkboxClass, selectClass } from "@/components/admin/styles";
import { toManilaInput, type Status } from "@/lib/rounds";

export type EventRow = {
  id: number;
  slug: string;
  starts_at: string | null;
  ends_at: string | null;
  status: Status;
  title: string;
  venue: string;
  summary: string;
  credit: string;
  cover: string | null;
  square: boolean;
  link_href: string | null;
  link_label: string | null;
  updated_at: string;
  updated_by: string | null;
};

const check = "flex items-center gap-2 text-sm font-semibold text-ink";

/** fields shared by the new and edit forms. slug is only editable on new */
export function EventFields({ event }: { event?: EventRow }) {
  return (
    <>
      {event ? (
        <Field label="Slug" hint="Used in the page address /events/<slug>. Can't be changed.">
          <Input value={event.slug} readOnly disabled />
        </Field>
      ) : (
        <Field label="Slug" hint="Used in the page address /events/<slug>. Can't be changed later.">
          <Input name="slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="e.g. hackathon-2026" />
        </Field>
      )}
      <Field label="Title">
        <Input name="title" defaultValue={event?.title} required />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker
          name="starts_at"
          label="Starts (Manila time)"
          hint="Leave empty to show Date TBA."
          emptyText="Date TBA"
          defaultValue={toManilaInput(event?.starts_at ?? null)}
          withTime
        />
        <DatePicker
          name="ends_at"
          label="Ends (optional)"
          hint="For events that run over days. Leave empty and it ends that night."
          emptyText="Same day"
          defaultValue={toManilaInput(event?.ends_at ?? null)}
          defaultTime="17:00"
          withTime
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" hint="Postponed keeps it as the next round with no countdown. Cancelled hides it from the site.">
          <select name="status" defaultValue={event?.status ?? "scheduled"} className={`${selectClass} w-full`}>
            <option value="scheduled">Scheduled</option>
            <option value="postponed">Postponed, new date to be announced</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Field>
        <Field label="Venue" hint="Short line under the title.">
          <Input name="venue" defaultValue={event?.venue} />
        </Field>
      </div>
      <Field label="Summary">
        <Textarea name="summary" defaultValue={event?.summary} />
      </Field>
      <Field label="Photo credit">
        <Input name="credit" defaultValue={event?.credit ?? "JPCS-TSU"} required />
      </Field>
      <ImageInput name="cover" label="Cover image" current={event?.cover} square={event?.square} />
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <label className={check}>
          <input type="checkbox" name="square" defaultChecked={event?.square} className={checkboxClass} />
          Square photos (pubmats), don&apos;t crop to 16:9
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Link address" hint="Optional, e.g. a registration or Facebook post.">
          <Input name="href" type="url" defaultValue={event?.link_href ?? ""} />
        </Field>
        <Field label="Link label" hint='Defaults to "Details".'>
          <Input name="label" defaultValue={event?.link_label ?? ""} />
        </Field>
      </div>
    </>
  );
}
