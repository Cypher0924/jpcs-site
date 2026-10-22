"use server";

import { z } from "zod";
import { failed, optional, parse, required, saved, type ActionState } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { pickImage, uploadImage } from "@/lib/media";
import { sessionClient } from "@/lib/supabase/server";

const schema = z.object({
  title: required("Title"),
  // datetime-local has no timezone. the chapter is in Manila (+08:00). empty shows "In progress"
  starts_at: z
    .string()
    .trim()
    .transform((v) => (v ? `${v}:00+08:00` : null)),
  venue: z.string().trim(),
  blurb: z.string().trim(),
  photo_caption: optional,
});

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
