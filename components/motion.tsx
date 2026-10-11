"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { useRef, type ReactNode } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const EASE = "power3.out";

/**
 * Scroll storytelling for the one-page site. Server components mark elements with
 * data-anim="..." and this client layer animates them. Every effect has a job:
 *
 *  lap            Nav progress bar: shows how far down the "lap" (page) you are.
 *  title / wipe   Broadcast-style wipe reveals each section title: marks a new segment.
 *  hero-*         Hero streaks away as you scroll: the car is leaving the grid.
 *  launch         Lists pull in one by one like cars leaving the pit lane: reading order.
 *  rise           Content blocks settle in as they enter: draws attention to new content.
 *  gallery-track  Desktop gallery becomes a pinned "long straight" you drive along.
 *  strip-a / b    Finish-line strips slide in opposite directions as you cross the Join band.
 *
 * Nothing is hidden before JS runs, and everything is skipped under prefers-reduced-motion.
 */
export function Motion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          tablet: "(min-width: 768px)",
          desktop: "(min-width: 1024px)",
        },
        (ctx) => {
          const { motion, tablet, desktop } = ctx.conditions as Record<string, boolean>;
          if (!motion) return;
          const q = gsap.utils.selector(root);

          // Smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
          // Anchor links respect html { scroll-padding-top } for the sticky nav.
          const lenis = new Lenis({ autoRaf: false, anchors: true });
          lenis.on("scroll", ScrollTrigger.update);
          const raf = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(raf);
          gsap.ticker.lagSmoothing(0);

          // Skip link: Lenis handles the scroll, we still move keyboard focus
          const skip = q<HTMLAnchorElement>('a[href="#main"]')[0];
          const focusMain = () => document.getElementById("main")?.focus({ preventScroll: true });
          skip?.addEventListener("click", focusMain);

          // Hero: copy lifts and fades, stripes streak left at different speeds
          gsap
            .timeline({ scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: 0.6 } })
            .to(q("[data-anim=hero-copy]"), { yPercent: -12, autoAlpha: 0.25, ease: "none" }, 0)
            .to(q("[data-anim=gantry]"), { y: -36, ease: "none" }, 0)
            .to(q("[data-anim=watermark]"), { yPercent: 30, ease: "none" }, 0)
            .to(q("[data-anim=stripe]"), { xPercent: (i: number) => -18 - i * 14, ease: "none" }, 0);

          // Section titles: orange wipe sweeps across, letters land behind it
          for (const title of q<HTMLElement>("[data-anim=title]")) {
            const header = title.closest("header");
            const wipe = header?.querySelector("[data-anim=wipe]");
            const slashes = header?.querySelectorAll("[data-anim=slashes] > span");
            const split = SplitText.create(title, { type: "words,chars" });
            gsap.set(split.chars, { autoAlpha: 0 });
            const tl = gsap.timeline({ scrollTrigger: { trigger: title, start: "top 85%", once: true } });
            if (slashes?.length) tl.from(slashes, { x: -12, autoAlpha: 0, stagger: 0.06, duration: 0.3, ease: EASE }, 0);
            if (wipe) tl.fromTo(wipe, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.32, ease: "power2.in" }, 0.05);
            tl.fromTo(
              split.chars,
              { autoAlpha: 0, yPercent: 45, skewX: -18 },
              { autoAlpha: 1, yPercent: 0, skewX: 0, stagger: 0.018, duration: 0.5, ease: EASE },
              wipe ? 0.32 : 0,
            );
            if (wipe) tl.to(wipe, { scaleX: 0, transformOrigin: "right center", duration: 0.4, ease: EASE }, 0.36);
          }

          // Generic reveals. Initial state is set here (not in CSS) so content shows without JS.
          const reveal = (selector: string, from: gsap.TweenVars, stagger = 0.08) => {
            const items = q<HTMLElement>(selector);
            if (!items.length) return;
            gsap.set(items, from);
            ScrollTrigger.batch(items, {
              start: "top 88%",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, { x: 0, y: 0, autoAlpha: 1, stagger, duration: 0.7, ease: EASE, overwrite: true }),
            });
          };
          reveal("[data-anim=rise] > *", { y: 32, autoAlpha: 0 });
          reveal("[data-anim=slide-in]", { x: -48, autoAlpha: 0 });
          reveal("[data-anim=launch] > *", { x: 56, autoAlpha: 0 }, 0.07);
          if (tablet) reveal("[data-anim=launch-desktop] > *", { x: 56, autoAlpha: 0 }, 0.06);

          // Desktop gallery: pinned horizontal "long straight"
          const gallery = q<HTMLElement>("#gallery")[0];
          const viewport = q<HTMLElement>("[data-anim=gallery-viewport]")[0];
          const track = q<HTMLElement>("[data-anim=gallery-track]")[0];
          if (desktop && gallery && viewport && track) {
            gallery.dataset.strip = "on";
            const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth);
            gsap.to(track, {
              x: () => -distance(),
              ease: "none",
              scrollTrigger: {
                trigger: gallery,
                start: "top 72px", // pin just under the sticky nav
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 1,
                invalidateOnRefresh: true,
              },
            });
          }

          // Join band: finish-line strips slide past each other
          const join = { trigger: "#join", start: "top bottom", end: "bottom top", scrub: true };
          gsap.to(q("[data-anim=strip-a]"), { backgroundPositionX: "+=192px", ease: "none", scrollTrigger: join });
          gsap.to(q("[data-anim=strip-b]"), { backgroundPositionX: "-=192px", ease: "none", scrollTrigger: join });

          // Lap progress last, so its "max" includes the gallery pin spacing
          gsap.fromTo(
            q("[data-anim=lap]"),
            { scaleX: 0 },
            { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
          );

          // Fonts change line lengths; re-measure once they are in
          document.fonts?.ready.then(() => ScrollTrigger.refresh());

          return () => {
            skip?.removeEventListener("click", focusMain);
            delete gallery?.dataset.strip;
            gsap.ticker.remove(raf);
            lenis.destroy();
          };
        },
      );
    },
    { scope: root },
  );

  return <div ref={root}>{children}</div>;
}
