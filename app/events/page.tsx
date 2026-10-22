import type { Metadata } from "next";
import { EventRow } from "@/components/sections";
import { Subpage } from "@/components/subpage";
import { SectionHeader } from "@/components/ui";
import { eventsCheckedAt, getEvents } from "@/lib/data";

export const metadata: Metadata = { title: "Race calendar · JPCS-TSU" };

export default async function EventsPage() {
  const [events, at] = await Promise.all([getEvents(), eventsCheckedAt()]);
  return (
    <Subpage back={{ href: "/#events", label: "Home" }}>
      <SectionHeader title="Race calendar" sub="Every JPCS-TSU event this year, round by round. Pick one to see its photos." />
      <ol className="mx-auto flex max-w-3xl flex-col gap-3">
        {events.map((e) => (
          <li key={e.slug}>
            <EventRow event={e} at={at} />
          </li>
        ))}
      </ol>
    </Subpage>
  );
}
