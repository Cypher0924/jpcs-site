"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { failed, optional, parse, saved, type ActionState } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { pickImage, uploadImage } from "@/lib/media";
import { sessionClient } from "@/lib/supabase/server";

const schema = z
  .object({
    // "No upcoming round": the site shows "To be announced" and the rest can stay empty
    tba: z
      .string()
      .optional()
      .transform((v) => v === "on"),
    title: z.string().trim(),
    // datetime-local has no timezone. the chapter is in Manila (+08:00). empty shows "In progress"
    starts_at: z
      .string()
      .trim()
      .transform((v) => (v ? `${v}:00+08:00` : null)),
    venue: z.string().trim(),
    blurb: z.string().trim(),
    photo_caption: optional,
  })
  .refine((v) => v.tba || v.title, "Title is required, or tick No upcoming round.");

export async function saveNextRound(_: ActionState, form: FormData): Promise<ActionState> {
  await requireStaff();
  const p = parse(schema, form);
  if ("error" in p) return p;
  try {
    const file = pickImage(form, "photo");
    const photo = file ? await uploadImage(file, "event") : undefined;
    const { error } = await (await sessionClient())
      .from("next_event")
      .update({ ...p.data, ...(photo && { photo }) })
      .eq("id", true);
    return error ? failed(error) : saved("next-event");
  } catch (e) {
    return failed(e);
  }
}

// "Officers' Clean-up Drive" → "officers-clean-up-drive"
const slugify = (title: string) =>
  title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "event";

/**
 * The round happened: copy it into Events as a finished round, then clear the Next round
 * so the site shows "To be announced". Opens the new event to add the recap photos.
 */
export async function finishRound(): Promise<ActionState> {
  await requireStaff();
  const db = await sessionClient();
  let newId: number;
  try {
    const { data: n, error } = await db.from("next_event").select("*").single();
    if (error) return failed(error);
    if (n.tba || !n.title) return { error: "There's no round to finish. Set the next round first." };

    // the date in Manila, as a plain calendar date
    const date = n.starts_at ? new Date(n.starts_at).toLocaleDateString("sv-SE", { timeZone: "Asia/Manila" }) : null;
    const event = {
      title: n.title,
      event_date: date,
      done: true,
      venue: n.venue,
      summary: n.blurb,
      credit: "JPCS-TSU",
      cover: n.photo,
    };
    // the slug must be unique, so try "-2", "-3"… when it's taken
    const base = slugify(n.title);
    let inserted: { id: number } | null = null;
    for (let i = 1; i <= 9 && !inserted; i++) {
      const res = await db
        .from("events")
        .insert({ ...event, slug: i === 1 ? base : `${base}-${i}` })
        .select("id")
        .single();
      if (res.error && res.error.code !== "23505") return failed(res.error);
      inserted = res.data;
    }
    if (!inserted) return { error: "Couldn't make a unique page address for this event. Add it from Events instead." };
    newId = inserted.id;

    const { error: clearError } = await db
      .from("next_event")
      .update({ tba: true, title: "", starts_at: null, venue: "", blurb: "", photo: null, photo_caption: null })
      .eq("id", true);
    if (clearError) return failed(clearError);
  } catch (e) {
    return failed(e);
  }
  saved("events");
  saved("next-event");
  redirect(`/admin/events/${newId}`);
}
