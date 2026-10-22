import Link from "next/link";
import { ActionForm, SubmitButton } from "@/components/admin/form";
import { PageHeader, Panel } from "@/components/admin/shell";
import { buttonClass } from "@/components/admin/styles";
import { requireStaff } from "@/lib/auth";
import { createEvent } from "../actions";
import { EventFields } from "../event-fields";

export const metadata = { title: "New event" };
export const instant = false;

export default async function NewEventPage() {
  await requireStaff();
  return (
    <>
      <PageHeader code="EVT" title="New event" sub="Add photos after saving." />
      <div className="max-w-2xl">
        <Panel>
          <ActionForm action={createEvent}>
            <EventFields />
            <div className="flex gap-3">
              <SubmitButton>Create event</SubmitButton>
              <Link href="/admin/events" className={buttonClass("secondary")}>
                Cancel
              </Link>
            </div>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
