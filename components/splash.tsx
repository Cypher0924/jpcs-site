"use client";

import { useEffect, useState } from "react";
import { LIGHT_STEP, LIGHTS_OUT } from "./hero";
import { LogoMark } from "./ui";

// Jumps every CSS animation to its end: the splash runs its normal cleanup and the hero headline lands at once.
const skip = () => document.getAnimations().forEach((a) => a.finish());

/**
 * First-visit start sequence. Plays the five start lights on the hero's clock, then a slanted carbon panel
 * with an orange trailing edge wipes off to reveal the hero as its headline drops in. Any key, click or tap
 * skips it. Once per tab session: the head script in app/layout.tsx sets data-splash="skip" before first
 * paint on repeat visits and under reduced motion, and CSS hides it. Without JS it still wipes away by CSS.
 */
export function Splash() {
  const [done, setDone] = useState(false);

  // Page scroll is locked in CSS while this is mounted ([data-splash="play"]:has(.splash) in globals.css),
  // and data-lenis-prevent keeps Lenis off it
  useEffect(() => {
    if (done || document.documentElement.dataset.splash === "skip") return;
    window.addEventListener("keydown", skip);
    return () => window.removeEventListener("keydown", skip);
  }, [done]);

  if (done) return null;

  return (
    <div
      data-theme="dark"
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
      {/* Wider than the viewport so the skewed corners stay covered; the orange band trails it off-screen */}
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

        {/* Loading bar: fills in step with the lights */}
        <span
          aria-hidden
          className="block h-0.5 origin-left bg-accent"
          style={{ animation: `splash-progress ${LIGHTS_OUT}s linear both` }}
        />
      </div>
    </div>
  );
}
