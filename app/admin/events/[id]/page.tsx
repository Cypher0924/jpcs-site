import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActionForm, SubmitButton } from "@/components/admin/form";
import { PageHeader, Panel } from "@/components/admin/shell";
import { buttonClass } from "@/components/admin/styles";
import { getEditors, lastEdited, requestNow } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { phase } from "@/lib/rounds";
import { deleteEvent, updateEvent } from "../actions";
import { EventFields } from "../event-fields";
import { PhotoOrder } from "./photo-order";
import { PhotoUploader } from "./photo-uploader";

export const metadata = { title: "Edit event" };
export const instant = false;

export default async function EditEventPage({
  params,
}: PageProps<"/admin/events/[id]">) {
  await requireStaff();
  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) notFound();

  const db = await sessionClient();
  const [{ data: event }, { data: photos }, editors] = await Promise.all([
    db.from("events").select("*").eq("id", id).maybeSingle(),
    db
      .from("event_photos")
      .select("id, src")
      .eq("event_id", id)
      .order("sort")
      .order("id"),
    getEditors(),
  ]);
  if (!event) notFound();
  const shows = phase(
    { startsAt: event.starts_at, endsAt: event.ends_at, status: event.status },
    await requestNow(),
  );

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
            <Link
              href={`/events/${event.slug}`}
              target="_blank"
              className={buttonClass("secondary")}
            >
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
              <EventFields event={event} shows={shows} />
              <div>
                <SubmitButton>Save event</SubmitButton>
              </div>
            </ActionForm>
          </Panel>
        </div>

        {/* once the round is over the photos are the job, so phones get them first */}
        <div className={shows === "finished" ? "max-xl:order-first" : ""}>
          <Panel title="Photos" meta={photos?.length ?? 0}>
            <PhotoUploader eventId={event.id} />
            <PhotoOrder
              eventId={event.id}
              photos={photos ?? []}
              square={event.square}
            />
            {!photos?.length && (
              <p className="mt-4 text-sm text-ink-muted">
                No photos yet. Pick one or more above, they upload one by one.
              </p>
            )}
          </Panel>
        </div>

        {/* last on phones so the frequent jobs come first, under Details on wide screens */}
        <div className="xl:col-start-1">
          <Panel title="Delete event">
            <p className="mb-3 text-sm text-ink-muted">
              Removes the event and all of its photos from the site.
            </p>
            <form action={deleteEvent}>
              <input type="hidden" name="id" value={event.id} />
              <ConfirmButton
                message={`Delete "${event.title}" and all of its photos? This can't be undone.`}
              >
                Delete event
              </ConfirmButton>
            </form>
          </Panel>
        </div>
      </div>
    </>
  );
}
