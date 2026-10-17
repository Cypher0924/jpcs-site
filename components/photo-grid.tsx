"use client";

import Image from "next/image";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { PhotoSlot } from "./ui";

/**
 * Photo grid whose tiles open an in-page viewer (native <dialog>) instead of the raw image file, so the
 * URL never changes. Close with ✕, Esc, a click outside the photo, or the browser/phone Back button;
 * step through with the arrows or ← →.
 */
export function PhotoGrid({
  photos,
  label,
  sizes,
  className = "",
  tileClassName = "",
  captions,
}: {
  photos: string[];
  /** Used for alt text: "<label>, photo 3". */
  label: string;
  sizes: string;
  className?: string;
  tileClassName?: string;
  /** One caption per photo, shown under its tile. */
  captions?: ReactNode[];
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const alt = (i: number) => `${label}, photo ${i + 1}`;
  const step = (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length));

  function show(i: number) {
    setOpen(i);
    dialog.current?.showModal();
    // Lets the phone/browser Back button close the viewer instead of leaving the page
    history.pushState({ photoViewer: true }, "");
  }

  // Closing by any route (✕, Esc, backdrop) goes through the dialog's close event; undo our history entry.
  function onClose() {
    setOpen(null);
    if (history.state?.photoViewer) history.back();
  }

  useEffect(() => {
    const onPop = () => dialog.current?.open && dialog.current.close();
    addEventListener("popstate", onPop);
    return () => removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open === null ? "" : "hidden";
  }, [open]);

  return (
    <>
      <ul className={className}>
        {photos.map((src, i) => (
          <li key={src}>
            <figure className="flex flex-col gap-2">
              <button type="button" onClick={() => show(i)} className="block w-full cursor-zoom-in" aria-label={`View ${alt(i)}`}>
                <PhotoSlot label={alt(i)} src={src} sizes={sizes} className={`transition-opacity hover:opacity-85 ${tileClassName}`} />
              </button>
              {captions && <figcaption>{captions[i]}</figcaption>}
            </figure>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialog}
        onClose={onClose}
        onClick={(e) => e.target === e.currentTarget && dialog.current?.close()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") step(1);
          if (e.key === "ArrowLeft") step(-1);
        }}
        aria-label={open === null ? label : alt(open)}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-carbon-950/95"
      >
        {open !== null && (
          <div className="pointer-events-none flex h-full flex-col items-center justify-center gap-4 p-4 md:p-10">
            <Image
              key={photos[open]}
              src={photos[open]}
              alt={alt(open)}
              width={1600}
              height={900}
              sizes="100vw"
              className="pointer-events-auto max-h-[80dvh] w-auto object-contain"
            />
            <div className="pointer-events-auto flex items-center gap-3 text-paper-100">
              <button type="button" onClick={() => step(-1)} className="grid size-11 place-items-center border border-carbon-700 hover:border-jpcs-orange" aria-label="Previous photo">
                ‹
              </button>
              <span className="type-data min-w-16 text-center text-sm">
                {open + 1} / {photos.length}
              </span>
              <button type="button" onClick={() => step(1)} className="grid size-11 place-items-center border border-carbon-700 hover:border-jpcs-orange" aria-label="Next photo">
                ›
              </button>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => dialog.current?.close()}
          className="fixed top-4 right-4 grid size-11 place-items-center border border-carbon-700 bg-carbon-950 text-xl text-paper-100 hover:border-jpcs-orange"
          aria-label="Close photo"
        >
          ✕
        </button>
      </dialog>
    </>
  );
}
