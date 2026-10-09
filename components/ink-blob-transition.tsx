"use client";

import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";

interface TransitionContextType {
  navigateWithBlob: (targetUrl: string, origin?: { x: number; y: number }) => void;
  isTransitioning: boolean;
}

const TransitionContext = createContext<TransitionContextType>({
  navigateWithBlob: () => {},
  isTransitioning: false,
});

export const useInkBlobRouter = () => useContext(TransitionContext);

const POINTS = 14;

// Deterministic pseudo-random wobbler so every vertex moves organically
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const WOBBLE = Array.from({ length: POINTS }, (_, i) => ({
  speed: 2.2 + hash(i) * 2.4,
  offset: hash(i + 40) * Math.PI * 2,
  amp: 0.14 + hash(i + 80) * 0.12,
}));

const blobClip = (r: number, wob: number, t: number, cx: number, cy: number) => {
  const pts: [number, number][] = [];
  for (let i = 0; i < POINTS; i++) {
    const a = (i / POINTS) * Math.PI * 2;
    const w = WOBBLE[i];
    const rad =
      r *
      (1 +
        wob *
          (w.amp * Math.sin(t * w.speed + w.offset) +
            0.07 * Math.sin(t * 1.3 + w.offset * 2.5)));
    pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
  }

  // Smooth closed curve: quadratics through midpoints
  const mid = (p: [number, number], q: [number, number]) =>
    [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2] as const;
  const [sx, sy] = mid(pts[POINTS - 1], pts[0]);
  let d = `M ${sx.toFixed(1)} ${sy.toFixed(1)}`;
  for (let i = 0; i < POINTS; i++) {
    const p = pts[i];
    const [mx, my] = mid(p, pts[(i + 1) % POINTS]);
    d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
  }
  return `path('${d} Z')`;
};

export function InkBlobProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const navigateWithBlob = useCallback(
    (targetUrl: string, origin?: { x: number; y: number }) => {
      if (typeof window === "undefined") return;

      const overlay = overlayRef.current;
      if (!overlay) {
        router.push(targetUrl);
        return;
      }

      setIsTransitioning(true);

      const cx = origin?.x ?? window.innerWidth / 2;
      const cy = origin?.y ?? window.innerHeight / 2;
      const maxR = Math.hypot(
        Math.max(cx, window.innerWidth - cx),
        Math.max(cy, window.innerHeight - cy)
      ) * 1.25;
      const dropR = Math.min(window.innerWidth, window.innerHeight) * 0.16;

      const state = { r: 0, wob: 1, t: 0, opacity: 1 };

      const apply = () => {
        if (!overlay) return;
        overlay.style.clipPath = blobClip(state.r, state.wob, state.t, cx, cy);
        overlay.style.opacity = String(state.opacity);
      };

      tlRef.current?.kill();
      const tl = gsap.timeline({
        onUpdate: apply,
        onComplete: () => {
          router.push(targetUrl);
          // Reverse shrink or fade out on route change
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.45,
            delay: 0.1,
            ease: "power2.out",
            onComplete: () => {
              setIsTransitioning(false);
              overlay.style.clipPath = "circle(0px at 50% 50%)";
              overlay.style.opacity = "1";
            },
          });
        },
      });

      tlRef.current = tl;

      // Organic splatter expansion:
      tl.to(state, { t: 5, duration: 0.75, ease: "none" }, 0);
      tl.to(state, { r: dropR, duration: 0.22, ease: "back.out(2.2)" }, 0);
      tl.to(state, { r: maxR, duration: 0.52, ease: "power3.inOut" }, 0.22);
      tl.to(state, { wob: 0, duration: 0.28, ease: "power2.out" }, 0.48);
    },
    [router]
  );

  return (
    <TransitionContext.Provider value={{ navigateWithBlob, isTransitioning }}>
      {children}
      {/* Fullscreen Ink Blob Overlay Container */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999] bg-[#07080c] transition-opacity"
        style={{
          clipPath: "circle(0px at 50% 50%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-slate-950 to-purple-950/60" />
        <div className="absolute inset-0 bg-dot-matrix opacity-40" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-indigo-300/80">
            <div className="relative size-12">
              <div className="absolute inset-0 animate-ping rounded-full bg-indigo-500/20" />
              <div className="flex size-12 items-center justify-center rounded-full border border-indigo-500/40 bg-indigo-950/80 backdrop-blur-sm">
                <svg
                  className="size-6 animate-spin text-indigo-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
              </div>
            </div>
            <span className="text-xs font-mono font-medium tracking-widest uppercase text-indigo-300/90">
              Transforming Sketch...
            </span>
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
