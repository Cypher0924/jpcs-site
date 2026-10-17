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
 * Scroll animations for the homepage. Elements opt in with data-anim (lap, title, wipe, hero-*, launch, rise,
 * gallery-track, strip-a/b). Nothing is hidden before JS runs and it all skips under reduced motion.
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

          // Lenis runs off GSAP's ticker so ScrollTrigger stays in sync
          // anchor links use html scroll-padding-top for the sticky nav
          const lenis = new Lenis({ autoRaf: false, anchors: true });
          lenis.on("scroll", ScrollTrigger.update);
          const raf = (time: number) => lenis.raf(time * 1000);
          gsap.ticker.add(raf);
          gsap.ticker.lagSmoothing(0);

          // skip link: Lenis does the scroll, we still move keyboard focus
          const skip = q<HTMLAnchorElement>('a[href="#main"]')[0];
          const focusMain = () => document.getElementById("main")?.focus({ preventScroll: true });
          skip?.addEventListener("click", focusMain);

          // hero copy fades up, stripes streak left
          gsap
            .timeline({ scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: 0.6 } })
            .to(q("[data-anim=hero-copy]"), { yPercent: -12, autoAlpha: 0.25, ease: "none" }, 0)
            .to(q("[data-anim=gantry]"), { y: -36, ease: "none" }, 0)
            .to(q("[data-anim=watermark]"), { yPercent: 30, ease: "none" }, 0)
            .to(q("[data-anim=stripe]"), { xPercent: (i: number) => -18 - i * 14, ease: "none" }, 0);

          // section titles: orange wipe, then letters land
          for (const title of q<HTMLElement>("[data-anim=title]")) {
            const wipe = title.parentElement?.querySelector("[data-anim=wipe]");
            const split = SplitText.create(title, { type: "words,chars" });
            gsap.set(split.chars, { autoAlpha: 0 });
            const tl = gsap.timeline({ scrollTrigger: { trigger: title, start: "top 85%", once: true } });
            if (wipe) tl.fromTo(wipe, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.32, ease: "power2.in" }, 0.05);
            tl.fromTo(
              split.chars,
              { autoAlpha: 0, yPercent: 45, skewX: -18 },
              { autoAlpha: 1, yPercent: 0, skewX: 0, stagger: 0.018, duration: 0.5, ease: EASE },
              wipe ? 0.32 : 0,
            );
            if (wipe) tl.to(wipe, { scaleX: 0, transformOrigin: "right center", duration: 0.4, ease: EASE }, 0.36);
          }

          // start state is set here, not in CSS, so content shows without JS
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

          // desktop gallery, pinned and scrolled sideways
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

          // join band strips slide past each other
          const join = { trigger: "#join", start: "top bottom", end: "bottom top", scrub: true };
          gsap.to(q("[data-anim=strip-a]"), { backgroundPositionX: "+=192px", ease: "none", scrollTrigger: join });
          gsap.to(q("[data-anim=strip-b]"), { backgroundPositionX: "-=192px", ease: "none", scrollTrigger: join });

          // lap progress last so its max includes the gallery pin spacing
          gsap.fromTo(
            q("[data-anim=lap]"),
            { scaleX: 0 },
            { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } },
          );

          // fonts change line lengths, re-measure once loaded
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
