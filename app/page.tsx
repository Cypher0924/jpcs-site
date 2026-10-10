import { Hero } from "@/components/hero";
import { Nav } from "@/components/nav";
import { About, Events, Faq, Footer, Gallery, Join, Officers, Programs, Stats } from "@/components/sections";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Stats />
        <Officers />
        <Events />
        <Programs />
        <Gallery />
        <Join />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
