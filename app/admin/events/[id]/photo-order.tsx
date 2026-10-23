"use client";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useTransition, type ReactNode } from "react";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { buttonClass } from "@/components/admin/styles";
import { deleteEventPhoto, saveEventPhotoOrder } from "../actions";

const arrow =
  "grid size-10 place-items-center border border-line text-ink-muted transition-colors hover:border-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text disabled:opacity-30 md:size-8";

/**
 * Rearrange the photos here, then save the order once. The first photo leads the event page.
 * Drag them (press and hold on phones, Space then arrows on a keyboard) or use the arrow buttons.
 * Deleting stays immediate, with its own confirm.
 */
export function PhotoOrder({
  eventId,
  photos,
  square,
}: {
  eventId: number;
  photos: { id: number; src: string }[];
  square: boolean;
}) {
  const [order, setOrder] = useState(photos.map((p) => p.id));
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<{
    error?: string;
    ok?: string;
  } | null>(null);
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
    setOrder(arrayMove(order, from, to));
    setMessage(null);
  };
  // mouse drags after a few pixels, touch after a short hold so the page still scrolls
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id)
      move(order.indexOf(Number(active.id)), order.indexOf(Number(over.id)));
  };

  return (
    <form
      data-dirty={changed || undefined}
      onSubmit={(e) => {
        // the delete buttons submit to their own action, let React run it
        if (
          (e.nativeEvent as SubmitEvent).submitter?.getAttribute("name") ===
          "id"
        )
          return;
        e.preventDefault();
        start(async () =>
          setMessage(await saveEventPhotoOrder(eventId, order)),
        );
      }}
    >
      {order.length > 1 && (
        <p className="mt-4 text-xs text-ink-muted">
          Drag photos into order (press and hold on a phone), or use the arrows.
          Then save the order.
        </p>
      )}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={order} strategy={rectSortingStrategy}>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {order.map((id, i) => {
              const p = byId.get(id);
              if (!p) return null;
              const n = i + 1;
              return (
                <Tile key={id} id={id} label={`Photo ${n}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- small admin thumbnails */}
                  <img
                    src={p.src}
                    alt=""
                    loading="lazy"
                    draggable={false}
                    className={`pointer-events-none w-full bg-surface-2 object-cover ${square ? "aspect-square" : "aspect-video"}`}
                  />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex gap-2 md:gap-1">
                      <button
                        type="button"
                        className={arrow}
                        disabled={i === 0}
                        onClick={() => move(i, i - 1)}
                        aria-label={`Move photo ${n} earlier`}
                      >
                        <svg
                          aria-hidden
                          viewBox="0 0 16 16"
                          className="size-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m10 4-4 4 4 4" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className={arrow}
                        disabled={i === order.length - 1}
                        onClick={() => move(i, i + 1)}
                        aria-label={`Move photo ${n} later`}
                      >
                        <svg
                          aria-hidden
                          viewBox="0 0 16 16"
                          className="size-4"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="m6 4 4 4-4 4" />
                        </svg>
                      </button>
                      {i > 0 && (
                        <button
                          type="button"
                          className={`${arrow} hidden sm:grid`}
                          onClick={() => move(i, 0)}
                          aria-label={`Make photo ${n} first`}
                          title="Make first"
                        >
                          <svg
                            aria-hidden
                            viewBox="0 0 16 16"
                            className="size-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M4 3v10M12 4 8 8l4 4" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <ConfirmButton
                      message={`Delete photo ${n}?`}
                      label={`Delete photo ${n}`}
                      formAction={deleteEventPhoto}
                      name="id"
                      value={id}
                    >
                      <svg
                        aria-hidden
                        viewBox="0 0 16 16"
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                      >
                        <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" />
                      </svg>
                    </ConfirmButton>
                  </div>
                </Tile>
              );
            })}
          </ul>
        </SortableContext>
      </DndContext>
      {order.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!changed || pending}
            className={buttonClass(changed ? "primary" : "secondary")}
          >
            {pending ? "Saving…" : "Save order"}
          </button>
          {changed && !pending && (
            <span className="text-xs font-semibold text-pending-text">
              Unsaved order
            </span>
          )}
          {message && (
            <span
              role={message.error ? "alert" : "status"}
              className={`text-sm font-semibold ${message.error ? "text-signal" : "text-live-text"}`}
            >
              {message.error ?? message.ok}
            </span>
          )}
        </div>
      )}
    </form>
  );
}

/** one photo you can drag. the picture is the handle, the buttons below stay clickable */
function Tile({
  id,
  label,
  children,
}: {
  id: number;
  label: string;
  children: ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const [picture, ...rest] = Array.isArray(children) ? children : [children];
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex flex-col gap-2 bg-surface-2 p-2 ${isDragging ? "relative z-10 opacity-80 shadow-[0_12px_32px_rgb(0_0_0/0.3)]" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        aria-label={`${label}, drag to reorder`}
        className="cursor-grab outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text active:cursor-grabbing"
      >
        {picture}
      </div>
      {rest}
    </li>
  );
}
