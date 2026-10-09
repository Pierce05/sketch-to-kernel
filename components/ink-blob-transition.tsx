"use client";

import React, { createContext, useContext, useState, useRef, useCallback } from "react";
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
  speed: 2.4 + hash(i) * 2.2,
  offset: hash(i + 40) * Math.PI * 2,
  amp: 0.16 + hash(i + 80) * 0.12,
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

      // Preload and navigate route behind immediately so target page renders without delay
      router.push(targetUrl);

      const cx = origin?.x ?? window.innerWidth / 2;
      const cy = origin?.y ?? window.innerHeight / 2;
      const maxR =
        Math.hypot(
          Math.max(cx, window.innerWidth - cx),
          Math.max(cy, window.innerHeight - cy)
        ) * 1.3;
      const dropR = Math.min(window.innerWidth, window.innerHeight) * 0.18;

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
          // As soon as ink blob floods the screen, fade out immediately to reveal target page
          gsap.to(overlay, {
            opacity: 0,
            duration: 0.35,
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

      // Fast, snappy organic ink splatter (0.45s total)
      tl.to(state, { t: 4, duration: 0.45, ease: "none" }, 0);
      tl.to(state, { r: dropR, duration: 0.15, ease: "back.out(2)" }, 0);
      tl.to(state, { r: maxR, duration: 0.3, ease: "power3.inOut" }, 0.15);
      tl.to(state, { wob: 0, duration: 0.2, ease: "power2.out" }, 0.25);
    },
    [router]
  );

  return (
    <TransitionContext.Provider value={{ navigateWithBlob, isTransitioning }}>
      {children}
      {/* Fullscreen Ink Blob Splatter Overlay */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9999] bg-[#2724d1] transition-opacity"
        style={{
          clipPath: "circle(0px at 50% 50%)",
        }}
      >
        {/* Drawably Blue Liquid Ink Splatter with organic edge wash */}
        <div className="absolute inset-0 bg-[#2724d1]" />
        <div className="absolute inset-0 bg-radial from-[#3b38ea] via-[#2724d1] to-[#1a1899] opacity-90" />
      </div>
    </TransitionContext.Provider>
  );
}
