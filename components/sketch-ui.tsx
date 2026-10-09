"use client";

import React, { useState, useEffect, useRef } from "react";
import rough from "roughjs";

interface SketchCardProps extends React.HTMLAttributes<HTMLDivElement> {
  roughness?: number;
  stroke?: string;
  fill?: string;
  resketchOnHover?: boolean;
}

export function SketchCard({
  children,
  className = "",
  roughness = 1.6,
  stroke = "currentColor",
  fill,
  resketchOnHover = true,
  ...props
}: SketchCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 10000));

  useEffect(() => {
    const el = containerRef.current;
    const svg = svgRef.current;
    if (!el || !svg) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    svg.innerHTML = "";

    const rc = rough.svg(svg);
    const node = rc.rectangle(3, 3, Math.max(10, rect.width - 6), Math.max(10, rect.height - 6), {
      seed,
      roughness,
      stroke: stroke === "currentColor" ? "#475569" : stroke,
      strokeWidth: 2,
      fill: fill ?? undefined,
      fillStyle: "zigzag",
    });
    svg.appendChild(node);
  }, [seed, roughness, stroke, fill]);

  const handleMouseEnter = () => {
    if (resketchOnHover) {
      setSeed(Math.floor(Math.random() * 10000));
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      className={`relative isolate ${className}`}
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

interface SketchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "outline" | "sketch";
  stroke?: string;
  fill?: string;
  tone?: "primary" | "secondary" | "danger";
}

export function SketchButton({
  children,
  className = "",
  variant = "sketch",
  stroke,
  fill,
  tone = "primary",
  ...props
}: SketchButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 10000));

  const strokeColor =
    stroke ||
    (tone === "primary" ? "#4f46e5" : tone === "danger" ? "#e11d48" : "#475569");
  const fillColor =
    fill ||
    (variant === "solid"
      ? tone === "primary"
        ? "rgba(79, 70, 229, 0.15)"
        : "rgba(225, 29, 72, 0.15)"
      : undefined);

  useEffect(() => {
    const el = btnRef.current;
    const svg = svgRef.current;
    if (!el || !svg) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    svg.innerHTML = "";

    const rc = rough.svg(svg);
    const node = rc.rectangle(2, 2, Math.max(10, rect.width - 4), Math.max(10, rect.height - 4), {
      seed,
      roughness: 1.8,
      stroke: strokeColor,
      strokeWidth: 2,
      fill: fillColor,
      fillStyle: "hachure",
    });
    svg.appendChild(node);
  }, [seed, strokeColor, fillColor]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setSeed(Math.floor(Math.random() * 10000));
    props.onMouseEnter?.(e);
  };

  return (
    <button
      ref={btnRef}
      onMouseEnter={handleMouseEnter}
      className={`relative isolate cursor-pointer font-mono text-xs font-semibold px-4 py-2 transition-transform active:scale-95 ${className}`}
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

interface SketchBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  stroke?: string;
  fill?: string;
}

export function SketchBadge({
  children,
  className = "",
  stroke = "#6366f1",
  fill = "rgba(99, 102, 241, 0.12)",
  ...props
}: SketchBadgeProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 10000));

  useEffect(() => {
    const el = spanRef.current;
    const svg = svgRef.current;
    if (!el || !svg) return;

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    svg.innerHTML = "";

    const rc = rough.svg(svg);
    const node = rc.rectangle(2, 2, Math.max(10, rect.width - 4), Math.max(10, rect.height - 4), {
      seed,
      roughness: 1.5,
      stroke,
      strokeWidth: 1.5,
      fill,
      fillStyle: "solid",
    });
    svg.appendChild(node);
  }, [seed, stroke, fill]);

  return (
    <span
      ref={spanRef}
      onMouseEnter={() => setSeed(Math.floor(Math.random() * 10000))}
      className={`relative isolate inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-0.5 ${className}`}
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
