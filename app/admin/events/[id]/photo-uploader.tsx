"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import { downscale } from "@/components/admin/image-input";
import { addEventPhoto } from "../actions";

/** uploads picked photos one request each, Vercel rejects bodies over 4.5 MB */
export function PhotoUploader({ eventId }: { eventId: number }) {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const files = Array.from(input.files ?? []);
    if (!files.length) return;
    setBusy(true);
    setErrors([]);
    const failures: string[] = [];
    for (const [i, file] of files.entries()) {
      setStatus(`Uploading ${i + 1} of ${files.length}…`);
      try {
        const form = new FormData();
        form.set("event_id", String(eventId));
        form.set("photo", await downscale(file));
        const res = await addEventPhoto(form);
        if (res.error) failures.push(`${file.name}: ${res.error}`);
      } catch (err) {
        failures.push(`${file.name}: ${err instanceof Error ? err.message : "Upload failed."}`);
      }
    }
    input.value = "";
    setErrors(failures);
    setStatus(`Uploaded ${files.length - failures.length} of ${files.length}.`);
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1.5">
      <input
        type="file"
        accept="image/*"
        multiple
        disabled={busy}
        onChange={onChange}
        className="text-sm file:mr-3 file:border file:border-line-strong file:bg-transparent file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-ink"
      />
      {status && (
        <p role="status" className="text-sm text-ink-muted">
          {status}
        </p>
      )}
      {errors.map((m) => (
        <p key={m} className="text-sm text-signal">
          {m}
        </p>
      ))}
    </div>
  );
}
