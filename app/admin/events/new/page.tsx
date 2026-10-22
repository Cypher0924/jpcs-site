import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/admin/form";
import { PageHeader, Panel } from "@/components/admin/shell";
import { requireStaff } from "@/lib/auth";
import { createEvent } from "../actions";
import { EventFields } from "../event-fields";

export const metadata = { title: "New event" };
export const instant = false;

export default async function NewEventPage() {
  await requireStaff();
  return (
    <>
      <PageHeader title="New event" sub="Add photos after saving." />
      <div className="max-w-2xl">
        <Panel>
          <ActionForm action={createEvent}>
            <EventFields />
            <div className="flex gap-2">
              <SubmitButton>Create event</SubmitButton>
              <Link href="/admin/events" className="inline-flex h-10 items-center px-4 text-sm font-semibold text-ink-muted hover:text-ink">
                Cancel
              </Link>
            </div>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
