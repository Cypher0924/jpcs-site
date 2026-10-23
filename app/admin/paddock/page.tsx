import Image from "next/image";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActionForm, Field, Input, SubmitButton } from "@/components/admin/form";
import { ImageInput } from "@/components/admin/image-input";
import { MoveButtons } from "@/components/admin/move-buttons";
import { ItemFooter, PageHeader, Panel } from "@/components/admin/shell";
import { getEditors, lastEdited } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { deletePhoto, replacePhoto, savePhoto, savePhotos } from "./actions";

export const metadata = { title: "Paddock" };
export const instant = false;

export default async function PaddockPage() {
  await requireStaff();
  const [{ data: photos }, editors] = await Promise.all([
    (await sessionClient()).from("gallery_items").select("*").order("sort").order("id"),
    getEditors(),
  ]);
  const list = photos ?? [];

  return (
    <>
      <PageHeader
        code="PAD"
        title="Paddock"
        sub="The homepage photo strip. The first photo is the large one. The full gallery page shows every event's photos instead."
      />
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ul className="flex flex-col gap-3">
          {list.map((g, i) => (
            <li key={g.id} className="flex flex-col gap-4 border border-line bg-surface p-4 sm:flex-row">
              <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-surface-2 sm:w-44">
                <Image src={g.src} alt={g.caption} fill sizes="176px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-canvas/90 px-2 py-0.5 text-xs font-semibold text-ink">Large tile</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                {/* captions join the one "Save captions" form under the list */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <input type="hidden" name="id" value={g.id} form="paddock-form" />
                  <Field label="Caption">
                    <Input name="caption" defaultValue={g.caption} required form="paddock-form" />
                  </Field>
                  <Field label="Photo credit">
                    <Input name="credit" defaultValue={g.credit} required form="paddock-form" />
                  </Field>
                </div>
                {/* a new photo uploads on its own: one image per request keeps under the upload limit */}
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-semibold">Replace photo</summary>
                  <ActionForm action={replacePhoto} className="mt-3 flex flex-col gap-3">
                    <input type="hidden" name="id" value={g.id} />
                    <ImageInput name="photo" label="New photo" current={g.src} required />
                    <div>
                      <SubmitButton variant="secondary" pendingText="Uploading…">
                        Upload new photo
                      </SubmitButton>
                    </div>
                  </ActionForm>
                </details>
                <ItemFooter edited={lastEdited(g, editors)} name={g.caption}>
                  <MoveButtons menu table="gallery_items" id={g.id} first={i === 0} last={i === list.length - 1} />
                  <form action={deletePhoto}>
                    <input type="hidden" name="id" value={g.id} />
                    <ConfirmButton message={`Remove "${g.caption}" from the Paddock?`} menu>
                      Remove from Paddock
                    </ConfirmButton>
                  </form>
                </ItemFooter>
              </div>
            </li>
          ))}
          {list.length > 0 && (
            <li>
              <ActionForm id="paddock-form" action={savePhotos}>
                <div>
                  <SubmitButton>Save captions</SubmitButton>
                </div>
              </ActionForm>
            </li>
          )}
        </ul>

        <Panel title="Add a photo">
          <ActionForm action={savePhoto}>
            <ImageInput name="photo" label="Photo" required />
            <Field label="Caption">
              <Input name="caption" required placeholder="e.g. Meet & Greet Booth" />
            </Field>
            <Field label="Photo credit" hint="Who took it. Use JPCS-TSU if nobody was credited.">
              <Input name="credit" defaultValue="JPCS-TSU" required />
            </Field>
            <div>
              <SubmitButton pendingText="Uploading…">Add photo</SubmitButton>
            </div>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
