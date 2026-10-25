"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

gsap.registerPlugin(useGSAP);

type Streak = { x: number; y: number; len: number; speed: number; alpha: number; hot: boolean };

const RISE = 0.03; // streaks climb slightly toward their bright end
const HOT_SHARE = 0.18; // about one in five is orange

/**
 * Homepage background: tarmac grain and thin speed streaks drifting left.
 * Scrolling fast stretches and speeds them up, they settle when scrolling stops. Still under reduced motion.
 */
export function Slipstream() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useGSAP(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    let w = 0;
    let h = 0;
    let streaks: Streak[] = [];
    let colors = { base: "", hot: "" };
    let boost = 0;

    const make = (x = Math.random() * w): Streak => ({
      x,
      y: Math.random() * h,
      len: 40 + Math.random() * 120,
      speed: 0.15 + Math.random() * 0.35,
      alpha: 0.25 + Math.random() * 0.5,
      hot: Math.random() < HOT_SHARE,
    });

    const readColors = () => {
      const css = getComputedStyle(document.documentElement);
      colors = { base: css.getPropertyValue("--streak").trim(), hot: css.getPropertyValue("--streak-hot").trim() };
    };

    // width decides the count, so phones get fewer. height changes (phone toolbars) keep the streaks in place
    const size = () => {
      const ratio = Math.min(devicePixelRatio || 1, 2);
      const widthChanged = c.clientWidth !== w;
      w = c.clientWidth;
      h = c.clientHeight;
      c.width = w * ratio;
      c.height = h * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      if (widthChanged) streaks = Array.from({ length: Math.round(w / 18) }, () => make());
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      // phones: text runs full width, so streaks stretch but never brighten over it
      const lift = w < 768 ? 0.35 : Math.min(1, 0.35 + boost / 25);
      for (const s of streaks) {
        const len = s.len * (1 + boost / 14);
        const g = ctx.createLinearGradient(s.x, 0, s.x + len, 0);
        g.addColorStop(0, `rgb(${s.hot ? colors.hot : colors.base} / 0)`);
        g.addColorStop(1, `rgb(${s.hot ? colors.hot : colors.base} / ${s.alpha * (s.hot ? 0.8 : 0.35) * lift})`);
        ctx.strokeStyle = g;
        ctx.lineWidth = s.hot ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + len, s.y - len * RISE);
        ctx.stroke();
      }
    };

    readColors();
    size();
    draw();

    const theme = new MutationObserver(() => {
      readColors();
      draw();
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const onResize = () => {
      size();
      draw();
    };
    window.addEventListener("resize", onResize);

    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      let lastY = scrollY;
      const tick = (_time: number, deltaMs: number) => {
        const step = Math.min(deltaMs, 50) / (1000 / 60); // 1 at 60fps
        boost = Math.min(boost + Math.abs(scrollY - lastY) * 0.6, 60);
        lastY = scrollY;
        boost *= 0.92 ** step;
        for (const s of streaks) {
          s.x -= (s.speed + boost * 0.7 * s.speed) * step;
          if (s.x + s.len * (1 + boost / 14) < 0) Object.assign(s, make(w + Math.random() * 40));
        }
        draw();
      };
      gsap.ticker.add(tick);
      return () => gsap.ticker.remove(tick);
    });

    return () => {
      theme.disconnect();
      window.removeEventListener("resize", onResize);
    };
  });

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
      <div className="grain h-full">
        <canvas ref={canvas} className="block h-lvh w-full" />
      </div>
    </div>
  );
}
