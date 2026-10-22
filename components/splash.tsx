"use client";

import { useEffect, useState } from "react";
import { LIGHT_STEP, LIGHTS_OUT } from "./lights";
import { LogoMark } from "./ui";

// finishes every CSS animation so cleanup runs and the headline lands at once
const skip = () => document.getAnimations().forEach((a) => a.finish());

/**
 * First-visit start lights, then a slanted wipe. Any key/click/tap skips it. Once per tab: head script in
 * layout.tsx sets data-splash="skip" on repeat visits and reduced motion. Without JS it still wipes away by CSS.
 */
export function Splash() {
  const [done, setDone] = useState(false);

  // scroll is locked in CSS while mounted (globals.css), data-lenis-prevent keeps Lenis off it
  useEffect(() => {
    if (done || document.documentElement.dataset.splash === "skip") return;
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [done]);

  if (done) return null;

  return (
    <div
      data-lenis-prevent
      className="splash fixed inset-0 z-[70] overflow-hidden"
      style={{ animation: `splash-done 0s ${LIGHTS_OUT + 0.5}s forwards` }}
      onPointerDown={skip}
      onAnimationEnd={(e) => {
        if (e.animationName !== "splash-done") return;
        try {
          sessionStorage.setItem("splash", "1");
        } catch {}
        setDone(true);
      }}
    >
      {/* wider than the viewport so the skewed corners stay covered, orange band trails it off-screen */}
      <div
        aria-hidden
        className="absolute inset-y-0 -right-[15vh] -left-[15vh] bg-canvas"
        style={{ animation: `splash-wipe 450ms var(--ease-brake) ${LIGHTS_OUT}s both` }}
      >
        <span className="absolute inset-y-0 right-full w-[clamp(2.5rem,6vw,5rem)] bg-accent" />
      </div>

      <div className="relative flex h-full flex-col" style={{ animation: `splash-fade 150ms ${LIGHTS_OUT}s forwards` }}>
        <div aria-hidden className="flex flex-1 flex-col items-center justify-center gap-10 md:gap-14">
          <LogoMark size={128} className="size-20 md:size-24 lg:size-32" />
          <div className="flex gap-2 md:gap-4 lg:gap-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-2 border border-line bg-surface p-2 md:gap-3 md:p-3 lg:gap-4 lg:p-4">
                {[0, 1].map((row) => (
                  <span
                    key={row}
                    className="block size-9 rounded-full bg-surface-2 md:size-16 lg:size-24"
                    style={{
                      animation: `light-on 120ms ${i * LIGHT_STEP + 0.4}s forwards, lights-out 80ms ${LIGHTS_OUT}s forwards`,
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={skip}
          className="absolute right-3 bottom-4 min-h-11 px-3 text-sm text-ink-muted transition-colors hover:text-ink md:right-5"
        >
          Skip intro
        </button>

        {/* loading bar, fills with the lights */}
        <span
          aria-hidden
          className="block h-0.5 origin-left bg-accent"
          style={{ animation: `splash-progress ${LIGHTS_OUT}s linear both` }}
        />
      </div>
    </div>
  );
}
