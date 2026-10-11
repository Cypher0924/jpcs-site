import Link from "next/link";
import type { ReactNode } from "react";
import { Nav } from "./nav";
import { Footer } from "./sections";
import { Container } from "./ui";

/**
 * Chrome for pages outside the homepage (/events, /gallery). Nav and footer links point back to the
 * homepage sections. No <Motion>, so no smooth scroll or scroll effects here.
 */
export function Subpage({ back, children }: { back?: { href: string; label: string }; children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <Nav base="/" />
      <main id="main" tabIndex={-1} className="overflow-x-clip pt-10 pb-20 outline-none md:pt-14 md:pb-28">
        <Container>
          {back && (
            <Link href={back.href} className="type-label mb-8 inline-block text-accent-text hover:underline">
              ← {back.label}
            </Link>
          )}
          {children}
        </Container>
      </main>
      <Footer base="/" />
    </>
  );
}
