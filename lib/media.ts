import "server-only";
import sharp, { type Sharp } from "sharp";
import { sessionClient } from "./supabase/server";

// resize presets, same as the photos already on the site
const presets = {
  event: (img: Sharp) => img.resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }),
  gallery: (img: Sharp) => img.resize({ width: 1600, withoutEnlargement: true }).webp({ quality: 78 }),
  officer: (img: Sharp) => img.resize(640, 640, { fit: "cover", position: "attention" }).webp({ quality: 80 }),
  merch: (img: Sharp) => img.resize(1024, 1024, { fit: "cover" }).webp({ quality: 78 }),
} as const;
export type ImageKind = keyof typeof presets;

const MAX_BYTES = 4 * 1024 * 1024;

/** a real image file from a form, or null when the field was left empty */
export function pickImage(form: FormData, field: string): File | null {
  const file = form.get(field);
  return file instanceof File && file.size > 0 ? file : null;
}

/**
 * Converts an upload to WebP and stores it in the public site-media bucket as the signed-in user (RLS checks staff).
 * Returns the public URL. Old files aren't deleted here, the weekly cron sweeps unreferenced ones.
 */
export async function uploadImage(file: File, kind: ImageKind): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image.");
  if (file.size > MAX_BYTES) throw new Error("That photo is too large. Try a smaller one.");

  const input = Buffer.from(await file.arrayBuffer());
  // .rotate() applies the phone's EXIF orientation before resizing
  const output = await presets[kind](sharp(input).rotate()).toBuffer();

  const supabase = await sessionClient();
  const path = `${kind}/${crypto.randomUUID()}.webp`;
  const { error } = await supabase.storage.from("site-media").upload(path, output, { contentType: "image/webp" });
  if (error) throw new Error(`Upload failed: ${error.message}`);
  return supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
}
