import { Field, Input, Textarea } from "@/components/admin/form";
import { ImageInput } from "@/components/admin/image-input";

export type EventRow = {
  id: number;
  slug: string;
  event_date: string | null;
  done: boolean;
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
        <Field label="Date" hint="Leave empty to show TBA.">
          <Input name="date" type="date" defaultValue={event?.event_date ?? ""} />
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
          <input type="checkbox" name="done" defaultChecked={event?.done} className="size-4 accent-accent" />
          Finished
        </label>
        <label className={check}>
          <input type="checkbox" name="square" defaultChecked={event?.square} className="size-4 accent-accent" />
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
