import { Hero } from "@/components/hero";
import { Motion } from "@/components/motion";
import { Nav } from "@/components/nav";
import { About, Events, Faq, Footer, Gallery, Join, Officers, Stats } from "@/components/sections";
import { Splash } from "@/components/splash";

export default function Home() {
  return (
    <Motion>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <Splash />
      <Nav />
      <main id="main" tabIndex={-1} className="overflow-x-clip outline-none">
        <Hero />
        <About />
        <Stats />
        <Officers />
        <Events />
        <Gallery />
        <Join />
        <Faq />
      </main>
      <Footer />
    </Motion>
  );
}
