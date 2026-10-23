import { ConfirmButton } from "@/components/admin/confirm-button";
import { ActionForm, Field, Input, SubmitButton, Textarea } from "@/components/admin/form";
import { ImageInput } from "@/components/admin/image-input";
import { MoveButtons } from "@/components/admin/move-buttons";
import { ItemFooter, PageHeader, Panel } from "@/components/admin/shell";
import { StatusChip } from "@/components/admin/status";
import { checkboxClass } from "@/components/admin/styles";
import { getEditors, lastEdited } from "@/lib/admin";
import { requireStaff } from "@/lib/auth";
import { sessionClient } from "@/lib/supabase/server";
import { deleteGroup, deleteItem, saveGroup, saveItem, saveSettings } from "./actions";

export const metadata = { title: "Merch" };
export const instant = false;

export default async function MerchPage() {
  await requireStaff();
  const db = await sessionClient();
  const [{ data: settings }, { data: groups }, { data: items }, editors] = await Promise.all([
    db.from("merch_settings").select("*").single(),
    db.from("merch_groups").select("*").order("sort").order("id"),
    db.from("merch_items").select("*").order("sort").order("id"),
    getEditors(),
  ]);
  const list = groups ?? [];

  return (
    <>
      <PageHeader code="MER" title="Merch" sub="Pre-order status, and the groups and items on the merch page." />
      <div className="flex flex-col gap-6">
        <Panel
          title="Pre-orders"
          meta={settings?.open ? <StatusChip status="live">Open</StatusChip> : <StatusChip status="pending">Closed</StatusChip>}
        >
          {settings && (
            <ActionForm action={saveSettings} className="grid gap-4 md:grid-cols-2">
              <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2">
                <input type="checkbox" name="open" defaultChecked={settings.open} className={checkboxClass} />
                Pre-orders are open
              </label>
              <Field label="Order form link" hint="Required when pre-orders are open. Shown as the Pre-order now button.">
                <Input name="form_url" type="url" defaultValue={settings.form_url ?? ""} />
              </Field>
              <Field label="Window" hint='Shown when closed: "The last run was open …"'>
                <Input name="window_text" defaultValue={settings.window_text} placeholder="Sept 8 to 25, 2026" />
              </Field>
              <p className="text-xs text-ink-muted md:col-span-2">{lastEdited(settings, editors)}</p>
              <div className="md:col-span-2">
                <SubmitButton>Save pre-orders</SubmitButton>
              </div>
            </ActionForm>
          )}
        </Panel>

        {list.map((g, gi) => {
          const mine = (items ?? []).filter((i) => i.group_id === g.id);
          return (
            <Panel key={g.id} title={g.title} meta={`${mine.length} ${mine.length === 1 ? "item" : "items"}`}>
              {gi === 0 && (
                <p className="mb-4 text-sm text-ink-muted">The first two items of this group are featured on the homepage.</p>
              )}
              <ActionForm action={saveGroup} className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="id" value={g.id} />
                <Field label="Title">
                  <Input name="title" defaultValue={g.title} required />
                </Field>
                <Field label="Key" hint="Used in links like /merch#shirts">
                  <Input name="key" defaultValue={g.key} pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
                </Field>
                <Field label="Note (optional)">
                  <Input name="note" defaultValue={g.note ?? ""} />
                </Field>
                <Field label="Credit label (optional)">
                  <Input name="credit_label" defaultValue={g.credit_label ?? ""} placeholder="Design by" />
                </Field>
                <div className="md:col-span-2">
                  <SubmitButton>Save group</SubmitButton>
                </div>
              </ActionForm>
              <ItemFooter edited={lastEdited(g, editors)}>
                <MoveButtons menu table="merch_groups" id={g.id} first={gi === 0} last={gi === list.length - 1} />
                <form action={deleteGroup}>
                  <input type="hidden" name="id" value={g.id} />
                  <ConfirmButton message={`Delete the "${g.title}" group? Its ${mine.length} item(s) are deleted too.`} menu>
                    Delete group
                  </ConfirmButton>
                </form>
              </ItemFooter>

              <div className="mt-6">
                <h3 className="mb-3 text-sm font-semibold">Items</h3>
                <ul className="flex flex-col gap-2">
                  {mine.map((it, ii) => (
                    <li key={it.id} className="bg-surface-2">
                      <details>
                        <summary className="flex cursor-pointer items-center gap-3 p-2">
                          {/* eslint-disable-next-line @next/next/no-img-element -- admin thumbnail, already optimised on upload */}
                          <img src={it.image} alt="" className="size-12 shrink-0 border border-line object-cover" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold">{it.name}</span>
                            <span className="type-data block text-xs text-ink-muted">
                              {it.from_price ? "From " : ""}PHP {it.price}
                            </span>
                          </span>
                          <span className="text-xs font-semibold text-ink-muted">Edit</span>
                        </summary>
                        <div className="px-3 pb-3">
                          <ActionForm action={saveItem} className="grid gap-3 md:grid-cols-2">
                            <input type="hidden" name="id" value={it.id} />
                            <input type="hidden" name="group_id" value={g.id} />
                            <ItemFields item={it} />
                            <div className="md:col-span-2">
                              <SubmitButton>Save item</SubmitButton>
                            </div>
                          </ActionForm>
                          <ItemFooter edited={lastEdited(it, editors)}>
                            <MoveButtons menu table="merch_items" id={it.id} first={ii === 0} last={ii === mine.length - 1} />
                            <form action={deleteItem}>
                              <input type="hidden" name="id" value={it.id} />
                              <ConfirmButton message={`Delete "${it.name}"?`} menu>
                                Delete item
                              </ConfirmButton>
                            </form>
                          </ItemFooter>
                        </div>
                      </details>
                    </li>
                  ))}
                </ul>
                <details className="mt-3 bg-surface-2">
                  <summary className="cursor-pointer p-3 text-sm font-semibold">Add item</summary>
                  <div className="px-3 pb-3">
                    <ActionForm action={saveItem} className="grid gap-3 md:grid-cols-2">
                      <input type="hidden" name="group_id" value={g.id} />
                      <ItemFields />
                      <div className="md:col-span-2">
                        <SubmitButton>Add item</SubmitButton>
                      </div>
                    </ActionForm>
                  </div>
                </details>
              </div>
            </Panel>
          );
        })}

        <Panel title="Add group">
          <ActionForm action={saveGroup} className="grid gap-3 md:grid-cols-2">
            <Field label="Title">
              <Input name="title" required />
            </Field>
            <Field label="Key" hint="Used in links like /merch#shirts">
              <Input name="key" pattern="[a-z0-9]+(-[a-z0-9]+)*" required />
            </Field>
            <Field label="Note (optional)">
              <Input name="note" />
            </Field>
            <Field label="Credit label (optional)">
              <Input name="credit_label" placeholder="Design by" />
            </Field>
            <div className="md:col-span-2">
              <SubmitButton>Add group</SubmitButton>
            </div>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}

type Item = { name: string; price: number; from_price: boolean; image: string; details: string | null; credit: string | null };

/** shared fields for the add and edit item forms. image is only required when adding */
function ItemFields({ item }: { item?: Item }) {
  return (
    <>
      <Field label="Name">
        <Input name="name" defaultValue={item?.name} required />
      </Field>
      <div className="flex flex-col gap-2">
        <Field label="Price (PHP)">
          <Input name="price" type="number" min={0} step={1} defaultValue={item?.price} required />
        </Field>
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          <input type="checkbox" name="from_price" defaultChecked={item?.from_price} className={checkboxClass} />
          Starting price, larger sizes may cost more
        </label>
      </div>
      <div className="md:col-span-2">
        <ImageInput name="image" label="Photo" current={item?.image} required square />
      </div>
      <Field label="Details (optional)">
        <Textarea name="details" rows={2} defaultValue={item?.details ?? ""} />
      </Field>
      <Field label="Credit (optional)" hint="The designers' names">
        <Input name="credit" defaultValue={item?.credit ?? ""} />
      </Field>
    </>
  );
}
