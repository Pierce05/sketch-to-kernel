"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  forwardRef,
} from "react";
import rough from "roughjs";

// Ensure wired-elements custom elements are loaded on client
if (typeof window !== "undefined") {
  import("wired-elements").catch(() => {
    // Ignore if already loaded or fallback
  });
}

/**
 * Common hook: Re-sketch on hover.
 * Regenerates the seed on mouse hover to produce a fresh, tactile pen stroke drawing.
 */
export function useResketch(initialSeed?: number) {
  const [seed, setSeed] = useState(
    () => initialSeed ?? Math.floor(Math.random() * 100000)
  );

  const resketch = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000));
  }, []);

  return { seed, resketch };
}

/* =========================================================================
   SKETCH CARD (Rough.js + Fresh Pen Sketch on Hover)
   ========================================================================= */

export interface SketchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  roughness?: number;
  bowing?: number;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  fillStyle?: "solid" | "hachure" | "zigzag" | "cross-hatch" | "dots";
  resketchOnHover?: boolean;
  shadow?: boolean;
}

export const SketchCard = forwardRef<HTMLDivElement, SketchCardProps>(
  (
    {
      children,
      className = "",
      roughness = 1.4,
      bowing = 1.2,
      stroke = "#18181b",
      strokeWidth = 2,
      fill = "#ffffff",
      fillStyle = "solid",
      resketchOnHover = true,
      shadow = true,
      onMouseEnter,
      ...props
    },
    forwardedRef
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const { seed, resketch } = useResketch();

    const draw = useCallback(() => {
      const el = containerRef.current;
      const svg = svgRef.current;
      if (!el || !svg) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
      svg.innerHTML = "";

      const rc = rough.svg(svg);

      // Optional hand-drawn shadow line offset
      if (shadow) {
        const shadowNode = rc.rectangle(
          5,
          5,
          Math.max(10, rect.width - 7),
          Math.max(10, rect.height - 7),
          {
            seed: seed + 1,
            roughness: 1.8,
            stroke: "rgba(24, 24, 27, 0.15)",
            strokeWidth: 2,
            fill: "rgba(24, 24, 27, 0.05)",
            fillStyle: "solid",
          }
        );
        svg.appendChild(shadowNode);
      }

      // Main napkin / paper card border
      const cardNode = rc.rectangle(
        2,
        2,
        Math.max(10, rect.width - 4),
        Math.max(10, rect.height - 4),
        {
          seed,
          roughness,
          bowing,
          stroke,
          strokeWidth,
          fill: fill || undefined,
          fillStyle,
        }
      );
      svg.appendChild(cardNode);
    }, [seed, roughness, bowing, stroke, strokeWidth, fill, fillStyle, shadow]);

    useEffect(() => {
      draw();
      const el = containerRef.current;
      if (!el || typeof ResizeObserver === "undefined") return;

      const observer = new ResizeObserver(() => {
        draw();
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, [draw]);

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
      if (resketchOnHover) {
        resketch();
      }
      onMouseEnter?.(e);
    };

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        onMouseEnter={handleMouseEnter}
        className={`relative isolate transition-transform duration-150 ${className}`}
        {...props}
      >
        <svg
          ref={svgRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible -z-10"
        />
        {children}
      </div>
    );
  }
);
SketchCard.displayName = "SketchCard";

/* =========================================================================
   SKETCH BUTTON (Hand-Drawn Tactile Button + Fresh Pen Sketch on Hover)
   ========================================================================= */

export interface SketchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "highlight";
  stroke?: string;
  fill?: string;
  resketchOnHover?: boolean;
}

export const SketchButton = forwardRef<HTMLButtonElement, SketchButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      stroke,
      fill,
      resketchOnHover = true,
      onMouseEnter,
      ...props
    },
    forwardedRef
  ) => {
    const btnRef = useRef<HTMLButtonElement | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const { seed, resketch } = useResketch();

    const getColors = useCallback(() => {
      if (stroke || fill) {
        return {
          stroke: stroke ?? "#18181b",
          fill: fill ?? "transparent",
          fillStyle: "solid" as const,
        };
      }

      switch (variant) {
        case "primary":
          return {
            stroke: "#2724d1", // Drawably ballpoint blue
            fill: "#2724d1",
            fillStyle: "solid" as const,
            textClass: "text-white font-bold",
          };
        case "danger":
          return {
            stroke: "#d12724", // Ruby red ink
            fill: "#d12724",
            fillStyle: "solid" as const,
            textClass: "text-white font-bold",
          };
        case "highlight":
          return {
            stroke: "#18181b",
            fill: "rgba(254, 240, 138, 0.9)", // Highlighter yellow
            fillStyle: "solid" as const,
            textClass: "text-[#18181b] font-bold",
          };
        case "outline":
          return {
            stroke: "#18181b",
            fill: "transparent",
            fillStyle: "solid" as const,
            textClass: "text-[#18181b] font-semibold",
          };
        case "secondary":
        default:
          return {
            stroke: "#18181b",
            fill: "#f5f4ee",
            fillStyle: "solid" as const,
            textClass: "text-[#18181b] font-semibold",
          };
      }
    }, [variant, stroke, fill]);

    const draw = useCallback(() => {
      const el = btnRef.current;
      const svg = svgRef.current;
      if (!el || !svg) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
      svg.innerHTML = "";

      const rc = rough.svg(svg);
      const cols = getColors();

      // Shadow stroke for depth
      const shadow = rc.rectangle(
        3,
        3,
        Math.max(6, rect.width - 4),
        Math.max(6, rect.height - 4),
        {
          seed: seed + 2,
          roughness: 1.4,
          stroke: "rgba(24, 24, 27, 0.2)",
          strokeWidth: 1.5,
          fill: "rgba(24, 24, 27, 0.08)",
          fillStyle: "solid",
        }
      );
      svg.appendChild(shadow);

      // Main button body
      const node = rc.rectangle(
        2,
        2,
        Math.max(6, rect.width - 4),
        Math.max(6, rect.height - 4),
        {
          seed,
          roughness: 1.5,
          stroke: cols.stroke,
          strokeWidth: 2,
          fill: cols.fill !== "transparent" ? cols.fill : undefined,
          fillStyle: cols.fillStyle,
        }
      );
      svg.appendChild(node);
    }, [seed, getColors]);

    useEffect(() => {
      draw();
      const el = btnRef.current;
      if (!el || typeof ResizeObserver === "undefined") return;

      const observer = new ResizeObserver(() => {
        draw();
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, [draw]);

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (resketchOnHover) {
        resketch();
      }
      onMouseEnter?.(e);
    };

    const cols = getColors();

    return (
      <button
        ref={(node) => {
          btnRef.current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        onMouseEnter={handleMouseEnter}
        className={`relative isolate inline-flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs cursor-pointer select-none transition-all duration-120 hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed ${cols.textClass || ""} ${className}`}
        {...props}
      >
        <svg
          ref={svgRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full overflow-visible -z-10"
        />
        {children}
      </button>
    );
  }
);
SketchButton.displayName = "SketchButton";

/* =========================================================================
   SKETCH BADGE (Hand-Drawn Pill / Stamp)
   ========================================================================= */

export interface SketchBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  stroke?: string;
  fill?: string;
  resketchOnHover?: boolean;
}

export function SketchBadge({
  children,
  className = "",
  stroke = "#2724d1",
  fill = "rgba(39, 36, 209, 0.08)",
  resketchOnHover = true,
  onMouseEnter,
  ...props
}: SketchBadgeProps) {
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { seed, resketch } = useResketch();

  const draw = useCallback(() => {
    const el = spanRef.current;
    const svg = svgRef.current;
    if (!el || !svg) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    svg.innerHTML = "";

    const rc = rough.svg(svg);
    const node = rc.rectangle(
      2,
      2,
      Math.max(6, rect.width - 4),
      Math.max(6, rect.height - 4),
      {
        seed,
        roughness: 1.3,
        stroke,
        strokeWidth: 1.5,
        fill: fill || undefined,
        fillStyle: "solid",
      }
    );
    svg.appendChild(node);
  }, [seed, stroke, fill]);

  useEffect(() => {
    draw();
    const el = spanRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => draw());
    observer.observe(el);
    return () => observer.disconnect();
  }, [draw]);

  return (
    <span
      ref={spanRef}
      onMouseEnter={(e) => {
        if (resketchOnHover) resketch();
        onMouseEnter?.(e);
      }}
      className={`relative isolate inline-flex items-center gap-1.5 px-3 py-1 font-mono text-xs select-none transition-transform hover:scale-102 ${className}`}
      {...props}
    >
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full overflow-visible -z-10"
      />
      {children}
    </span>
  );
}

/* =========================================================================
   SKETCH HIGHLIGHT (Highlighter Pen Marker Wash)
   ========================================================================= */

export function SketchHighlight({
  children,
  color = "yellow",
  className = "",
}: {
  children: React.ReactNode;
  color?: "yellow" | "blue" | "pink" | "green";
  className?: string;
}) {
  const colorMap = {
    yellow: "bg-yellow-200/70 border-yellow-300",
    blue: "bg-blue-200/60 border-blue-300",
    pink: "bg-pink-200/60 border-pink-300",
    green: "bg-emerald-200/60 border-emerald-300",
  };

  return (
    <span
      className={`relative inline-block px-1.5 py-0.5 rounded-sm ${colorMap[color]} font-semibold text-[#18181b] ${className}`}
      style={{
        boxDecorationBreak: "clone",
        WebkitBoxDecorationBreak: "clone",
      }}
    >
      {children}
    </span>
  );
}

/* =========================================================================
   SKETCH UNDERLINE (Hand-Drawn Wavy Pen Underline)
   ========================================================================= */

export function SketchUnderline({
  children,
  stroke = "#2724d1",
  className = "",
}: {
  children: React.ReactNode;
  stroke?: string;
  className?: string;
}) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const { seed, resketch } = useResketch();

  useEffect(() => {
    const el = containerRef.current;
    const svg = svgRef.current;
    if (!el || !svg) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;

    svg.setAttribute("viewBox", `0 0 ${rect.width} 12`);
    svg.innerHTML = "";

    const rc = rough.svg(svg);
    const line = rc.line(2, 6, rect.width - 2, 6, {
      seed,
      roughness: 1.8,
      bowing: 2,
      stroke,
      strokeWidth: 2.5,
    });
    svg.appendChild(line);
  }, [seed, stroke]);

  return (
    <span
      ref={containerRef}
      onMouseEnter={resketch}
      className={`relative inline-block ${className}`}
    >
      {children}
      <svg
        ref={svgRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 bottom-0 h-3 w-full overflow-visible"
      />
    </span>
  );
}

/* =========================================================================
   WIRED ELEMENTS REACT COMPONENT WRAPPERS
   ========================================================================= */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "wired-button": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { elevation?: number },
        HTMLElement
      >;
      "wired-card": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { elevation?: number; fill?: string },
        HTMLElement
      >;
      "wired-input": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          placeholder?: string;
          value?: string;
          type?: string;
        },
        HTMLElement
      >;
      "wired-divider": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & { elevation?: number },
        HTMLElement
      >;
    }
  }
}

export function WiredCardWrapper({
  children,
  elevation = 2,
  fill = "#ffffff",
  className = "",
}: {
  children: React.ReactNode;
  elevation?: number;
  fill?: string;
  className?: string;
}) {
  return (
    <div className={`wired-card-container ${className}`}>
      <wired-card elevation={elevation} fill={fill}>
        {children}
      </wired-card>
    </div>
  );
}
