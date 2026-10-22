import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActionForm, SubmitButton } from "@/components/admin/form";
import { MoveButtons } from "@/components/admin/move-buttons";
import { PageHeader, Panel } from "@/components/admin/shell";
import { buttonClass } from "@/components/admin/styles";
import { getEditors, lastEdited } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { deleteEvent, deleteEventPhoto, updateEvent } from "../actions";
import { EventFields } from "../event-fields";
import { PhotoUploader } from "./photo-uploader";

export const metadata = { title: "Edit event" };
export const instant = false;

export default async function EditEventPage({ params }: PageProps<"/admin/events/[id]">) {
  await requireStaff();
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const db = await sessionClient();
  const [{ data: event }, { data: photos }, editors] = await Promise.all([
    db.from("events").select("*").eq("id", id).maybeSingle(),
    db.from("event_photos").select("id, src").eq("event_id", id).order("sort").order("id"),
    getEditors(),
  ]);
  if (!event) notFound();

  return (
    <>
      <PageHeader
        code="EVT"
        title={event.title}
        sub={lastEdited(event, editors)}
        actions={
          <>
            <Link href="/admin/events" className={buttonClass("secondary")}>
              All events
            </Link>
            <Link href={`/events/${event.slug}`} target="_blank" className={buttonClass("secondary")}>
              View on site
            </Link>
          </>
        }
      />
      <div className="grid grid-flow-dense items-start gap-6 xl:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Panel title="Details">
            <ActionForm action={updateEvent}>
              <input type="hidden" name="id" value={event.id} />
              <EventFields event={event} />
              <div>
                <SubmitButton>Save event</SubmitButton>
              </div>
            </ActionForm>
          </Panel>
        </div>

        <Panel title="Photos" meta={photos?.length ?? 0}>
          <PhotoUploader eventId={event.id} />
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(photos ?? []).map((p, i, all) => (
              <li key={p.id} className="flex flex-col gap-2 border border-line bg-canvas p-2">
                {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnails */}
                <img src={p.src} alt="" loading="lazy" className={`w-full bg-surface-2 object-cover ${event.square ? "aspect-square" : "aspect-video"}`} />
                <div className="flex items-center justify-between gap-2">
                  <MoveButtons table="event_photos" id={p.id} first={i === 0} last={i === all.length - 1} />
                  <form action={deleteEventPhoto}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton message="Delete this photo?" label="Delete photo">
                      <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
                      </svg>
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          {!photos?.length && <p className="mt-4 text-sm text-ink-muted">No photos yet. Pick one or more above, they upload one by one.</p>}
        </Panel>

        {/* last on phones so the frequent jobs come first, under Details on wide screens */}
        <div className="xl:col-start-1">
          <Panel title="Delete event">
            <p className="mb-3 text-sm text-ink-muted">Removes the event and all of its photos from the site.</p>
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={event.id} />
              <ConfirmButton message={`Delete "${event.title}" and all of its photos? This can't be undone.`}>Delete event</ConfirmButton>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
