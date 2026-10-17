import type { Metadata } from "next";
import { PhotoGrid } from "@/components/photo-grid";
import { MerchCaption, MerchStatus } from "@/components/sections";
import { Subpage } from "@/components/subpage";
import { SectionHeader } from "@/components/ui";
import { merch } from "@/lib/content";

export const metadata: Metadata = { title: "Team kit · JPCS-TSU" };

export default function MerchPage() {
  return (
    <Subpage back={{ href: "/#merch", label: "Home" }}>
      <SectionHeader title="Team kit" sub="Every item in the JPCS 26/27 collection, with prices and the people who designed it." />

      <div className="flex flex-col gap-6 border-y border-line py-6 md:flex-row md:items-center md:justify-between">
        <MerchStatus />
        <nav aria-label="Merch categories">
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {merch.groups.map((g) => (
              <li key={g.id}>
                <a href={`#${g.id}`} className="type-label text-accent-text hover:underline">
                  {g.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="mt-14 flex flex-col gap-16">
        {merch.groups.map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`m-${g.id}`} className="scroll-mt-24">
            <div className="mb-5">
              <h2 id={`m-${g.id}`} className="type-heading">
                {g.title}
              </h2>
              {"note" in g && <p className="mt-1 text-sm text-ink-muted">{g.note}</p>}
            </div>
            <PhotoGrid
              photos={g.items.map((i) => i.image)}
              label={g.title}
              sizes="(min-width: 768px) 380px, 50vw"
              captions={g.items.map((i) => (
                <MerchCaption key={i.name} item={i} creditLabel={"creditLabel" in g ? g.creditLabel : undefined} />
              ))}
              className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4"
              tileClassName="aspect-square"
            />

            {g.id === "shirts" && (
              <table className="mt-10 w-full max-w-md text-left text-sm">
                <caption className="mb-3 text-left font-semibold">Size chart (inches)</caption>
                <thead className="type-label text-ink-muted">
                  <tr className="border-b border-line">
                    <th scope="col" className="py-2 font-[inherit]">Size</th>
                    <th scope="col" className="py-2 font-[inherit]">Width</th>
                    <th scope="col" className="py-2 font-[inherit]">Length</th>
                  </tr>
                </thead>
                <tbody className="type-data">
                  {merch.sizes.map(([size, width, length]) => (
                    <tr key={size} className="border-b border-line">
                      <th scope="row" className="py-2 font-[inherit]">{size}</th>
                      <td className="py-2">{width}</td>
                      <td className="py-2">{length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ))}
      </div>
    </Subpage>
  );
}
