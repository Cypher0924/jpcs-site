"use client";

import { useState, useTransition } from "react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { buttonClass } from "@/components/admin/styles";
import { deleteEventPhoto, saveEventPhotoOrder } from "../actions";

const arrow =
  "grid size-10 place-items-center border border-line text-ink-muted transition-colors hover:border-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:opacity-30 md:size-8";

/**
 * Rearrange the photos here, then save the order once. The first photo leads the event page.
 * Deleting stays immediate, with its own confirm.
 */
export function PhotoOrder({ eventId, photos, square }: { eventId: number; photos: { id: number; src: string }[]; square: boolean }) {
  const [order, setOrder] = useState(photos.map((p) => p.id));
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{ error?: string; ok?: string } | null>(null);
  // a deleted or newly uploaded photo resets the order to what the server has
  const saved = photos.map((p) => p.id).join(",");
  const [base, setBase] = useState(saved);
  if (base !== saved) {
    setBase(saved);
    setOrder(photos.map((p) => p.id));
  }
  const changed = order.join(",") !== saved;
  const byId = new Map(photos.map((p) => [p.id, p]));

  const move = (from: number, to: number) => {
    const next = [...order];
    const [id] = next.splice(from, 1);
    next.splice(to, 0, id);
    setOrder(next);
    setMessage(null);
  };

  return (
    <form
      data-dirty={changed || undefined}
      onSubmit={(e) => {
        // the delete buttons submit to their own action, let React run it
        if ((e.nativeEvent as SubmitEvent).submitter?.getAttribute("name") === "id") return;
        e.preventDefault();
        start(async () => setMessage(await saveEventPhotoOrder(eventId, order)));
      }}
    >
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {order.map((id, i) => {
          const p = byId.get(id);
          if (!p) return null;
          const n = i + 1;
          return (
            <li key={id} className="flex flex-col gap-2 bg-surface-2 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnails */}
              <img src={p.src} alt={`Photo ${n}`} loading="lazy" className={`w-full bg-surface-2 object-cover ${square ? "aspect-square" : "aspect-video"}`} />
              <div className="flex items-center justify-between gap-2">
                <div className="flex gap-2 md:gap-1">
                  <button type="button" className={arrow} disabled={i === 0} onClick={() => move(i, i - 1)} aria-label={`Move photo ${n} earlier`}>
                    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m10 4-4 4 4 4" />
                    </svg>
                  </button>
                  <button type="button" className={arrow} disabled={i === order.length - 1} onClick={() => move(i, i + 1)} aria-label={`Move photo ${n} later`}>
                    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="m6 4 4 4-4 4" />
                    </svg>
                  </button>
                  {i > 0 && (
                    <button type="button" className={`${arrow} hidden sm:grid`} onClick={() => move(i, 0)} aria-label={`Make photo ${n} first`} title="Make first">
                      <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 3v10M12 4 8 8l4 4" />
                      </svg>
                    </button>
                  )}
                </div>
                <ConfirmButton message={`Delete photo ${n}?`} label={`Delete photo ${n}`} formAction={deleteEventPhoto} name="id" value={id}>
                  <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.75">
                    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
                  </svg>
                </ConfirmButton>
              </div>
            </li>
          );
        })}
      </ul>
      {order.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={!changed || pending} className={buttonClass(changed ? "primary" : "secondary")}>
            {pending ? "Saving…" : "Save order"}
          </button>
          {changed && !pending && <span className="text-xs font-semibold text-pending-text">Unsaved order</span>}
          {message && (
            <span role={message.error ? "alert" : "status"} className={`text-sm font-semibold ${message.error ? "text-signal" : "text-live-text"}`}>
              {message.error ?? message.ok}
            </span>
          )}
        </div>
      )}
    </form>
  );
}
