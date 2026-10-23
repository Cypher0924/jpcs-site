"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";

/** shrinks a phone photo before upload: Vercel rejects request bodies over 4.5 MB. the server makes the final WebP */
async function downscale(file: File, max = 2400): Promise<File> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 3_500_000) return file;
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't read that image."))), "image/jpeg", 0.9),
  );
  return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
}

export { downscale };

/** file field with a preview. leaving it empty keeps the current image */
export function ImageInput({
  name,
  label,
  current,
  required,
  square,
}: {
  name: string;
  label: string;
  current?: string | null;
  required?: boolean;
  square?: boolean;
}) {
  const [preview, setPreview] = useState(current ?? undefined);
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const inputId = useId();

  // forms reset after a successful save, so drop the old preview too
  useEffect(() => {
    const form = ref.current?.form;
    const reset = () => setPreview(current ?? undefined);
    form?.addEventListener("reset", reset);
    return () => form?.removeEventListener("reset", reset);
  }, [current]);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const small = await downscale(file);
      const list = new DataTransfer();
      list.items.add(small);
      input.files = list.files;
      setPreview(URL.createObjectURL(small));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="flex flex-wrap items-center gap-4">
        <div className={`grid shrink-0 place-items-center overflow-hidden border border-line bg-surface-2 ${square ? "size-24" : "h-24 w-40"}`}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local blob previews, next/image can't load those
            <img src={preview} alt="" className="size-full object-cover" />
          ) : (
            <span className="text-xs text-ink-muted">No image</span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 basis-52 flex-col gap-1">
          <input
            ref={ref}
            id={inputId}
            type="file"
            name={name}
            accept="image/*"
            required={required && !current}
            onChange={onChange}
            className="w-full min-w-0 text-sm file:mr-3 file:h-9 file:cursor-pointer file:border file:border-line-strong file:bg-surface-2 file:px-3 file:text-sm file:font-semibold file:text-ink hover:file:bg-canvas focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-text"
          />
          <span className="text-xs text-ink-muted">
            {busy ? "Preparing photo…" : current ? "Leave empty to keep the current image." : "JPG, PNG or WebP. It's resized for you."}
          </span>
        </div>
      </div>
    </div>
  );
}
