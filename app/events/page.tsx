import type { Metadata } from "next";
import { EventRow } from "@/components/sections";
import { Subpage } from "@/components/subpage";
import { SectionHeader } from "@/components/ui";
import { events } from "@/lib/content";

export const metadata: Metadata = { title: "Race calendar · JPCS-TSU" };

export default function EventsPage() {
  return (
    <Subpage back={{ href: "/#events", label: "Home" }}>
      <SectionHeader title="Race calendar" sub="Every JPCS-TSU event this year, round by round. Pick one to see its photos." />
      <ol className="mx-auto flex max-w-3xl flex-col gap-3">
        {events.map((e) => (
          <li key={e.slug}>
            <EventRow event={e} />
          </li>
        ))}
      </ol>
    </Subpage>
  );
}
