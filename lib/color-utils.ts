/**
 * Color utility helpers for resolving accent colors, Tailwind color names,
 * and generating matching hover and glow shades for the live sandbox preview.
 */

export const TAILWIND_COLORS: Record<string, string> = {
  // Brand
  brand: "#2724d1",
  "brand-hover": "#1f1cb5",

  // Indigo
  indigo: "#4f46e5",
  "indigo-400": "#818cf8",
  "indigo-500": "#6366f1",
  "indigo-600": "#4f46e5",
  "indigo-700": "#4338ca",
  "indigo-800": "#3730a3",

  // Blue
  blue: "#2563eb",
  "blue-400": "#60a5fa",
  "blue-500": "#3b82f6",
  "blue-600": "#2563eb",
  "blue-700": "#1d4ed8",
  "blue-800": "#1e40af",

  // Violet
  violet: "#7c3aed",
  "violet-400": "#a78bfa",
  "violet-500": "#8b5cf6",
  "violet-600": "#7c3aed",
  "violet-700": "#6d28d9",
  "violet-800": "#5b21b6",

  // Purple
  purple: "#9333ea",
  "purple-400": "#c084fc",
  "purple-500": "#a855f7",
  "purple-600": "#9333ea",
  "purple-700": "#7e22ce",
  "purple-800": "#6b21a8",

  // Fuchsia
  fuchsia: "#c026d3",
  "fuchsia-500": "#d946ef",
  "fuchsia-600": "#c026d3",
  "fuchsia-700": "#a21caf",

  // Pink
  pink: "#db2777",
  "pink-400": "#f472b6",
  "pink-500": "#ec4899",
  "pink-600": "#db2777",
  "pink-700": "#be185d",

  // Rose
  rose: "#e11d48",
  "rose-400": "#fb7185",
  "rose-500": "#f43f5e",
  "rose-600": "#e11d48",
  "rose-700": "#be123c",

  // Red
  red: "#dc2626",
  "red-400": "#f87171",
  "red-500": "#ef4444",
  "red-600": "#dc2626",
  "red-700": "#b91c1c",

  // Orange
  orange: "#ea580c",
  "orange-400": "#fb923c",
  "orange-500": "#f97316",
  "orange-600": "#ea580c",
  "orange-700": "#c2410c",

  // Amber
  amber: "#d97706",
  "amber-400": "#fbbf24",
  "amber-500": "#f59e0b",
  "amber-600": "#d97706",
  "amber-700": "#b45309",

  // Yellow
  yellow: "#ca8a04",
  "yellow-400": "#facc15",
  "yellow-500": "#eab308",
  "yellow-600": "#ca8a04",

  // Lime
  lime: "#65a30d",
  "lime-500": "#84cc16",
  "lime-600": "#65a30d",

  // Green
  green: "#16a34a",
  "green-400": "#4ade80",
  "green-500": "#22c55e",
  "green-600": "#16a34a",
  "green-700": "#15803d",

  // Emerald
  emerald: "#059669",
  "emerald-400": "#34d399",
  "emerald-500": "#10b981",
  "emerald-600": "#059669",
  "emerald-700": "#047857",

  // Teal
  teal: "#0d9488",
  "teal-400": "#2dd4bf",
  "teal-500": "#14b8a6",
  "teal-600": "#0d9488",
  "teal-700": "#0f766e",

  // Cyan
  cyan: "#0891b2",
  "cyan-400": "#22d3ee",
  "cyan-500": "#06b6d4",
  "cyan-600": "#0891b2",
  "cyan-700": "#0e7490",

  // Sky
  sky: "#0284c7",
  "sky-400": "#38bdf8",
  "sky-500": "#0ea5e9",
  "sky-600": "#0284c7",
  "sky-700": "#0369a1",

  // Slate / Gray / Zinc / Neutral / Stone
  slate: "#475569",
  "slate-600": "#475569",
  "slate-700": "#334155",
  "slate-800": "#1e293b",
  gray: "#4b5563",
  "gray-600": "#4b5563",
  "gray-700": "#374151",
  "gray-800": "#1f2937",
  zinc: "#52525b",
  "zinc-600": "#52525b",
  "zinc-700": "#3f3f46",
  "zinc-800": "#27272a",
  black: "#000000",
  white: "#ffffff",
};

const CSS_NAMED_COLORS: Record<string, string> = {
  black: "#000000",
  white: "#ffffff",
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
  yellow: "#eab308",
  purple: "#a855f7",
  orange: "#f97316",
  pink: "#ec4899",
  cyan: "#06b6d4",
  teal: "#14b8a6",
  indigo: "#6366f1",
  violet: "#8b5cf6",
  magenta: "#d946ef",
  coral: "#f87171",
  gold: "#fbbf24",
  silver: "#94a3b8",
  gray: "#6b7280",
  grey: "#6b7280",
  navy: "#1e3a8a",
  brown: "#78350f",
  maroon: "#881337",
  olive: "#65a30d",
  lime: "#84cc16",
  aqua: "#06b6d4",
};

/**
 * Checks if a prop name or type represents a customizable color / accent.
 */
export function isColorProp(propName: string, propType?: string): boolean {
  if (propType && propType.toLowerCase() === "color") return true;
  return /accent|color|primary|theme|btn.*color|button.*color|btn.*bg|button.*bg|tint/i.test(
    propName
  );
}

/**
 * Normalizes any color input (hex, Tailwind color name, CSS named color, rgb, etc.)
 * into a clean 6-digit hex color string (#rrggbb).
 */
export function resolveToHex(input: string, fallback = "#2724d1"): string {
  if (!input || typeof input !== "string") return fallback;
  const trimmed = input.trim();
  if (!trimmed) return fallback;

  // 1. Clean potential brackets (e.g. [#4f46e5]) and utility prefixes (e.g. bg-, text-, border-)
  const clean = trimmed
    .replace(/^(bg|text|border)-/i, "")
    .replace(/^\[|\]$/g, "")
    .trim();

  // 2. Direct hex match (#rgb or #rrggbb or #rrggbbaa)
  const hexMatch = clean.match(/^#([0-9a-fA-F]{3,8})$/);
  if (hexMatch) {
    const raw = hexMatch[1];
    if (raw.length === 3) {
      return `#${raw[0]}${raw[0]}${raw[1]}${raw[1]}${raw[2]}${raw[2]}`.toLowerCase();
    }
    if (raw.length >= 6) {
      return `#${raw.slice(0, 6)}`.toLowerCase();
    }
  }

  const cleanName = clean.toLowerCase();

  // 3. Match Tailwind palette
  if (TAILWIND_COLORS[cleanName]) {
    return TAILWIND_COLORS[cleanName];
  }

  // If input was e.g. "indigo" and "indigo-600" is available
  if (TAILWIND_COLORS[`${cleanName}-600`]) {
    return TAILWIND_COLORS[`${cleanName}-600`];
  }

  // 4. Match CSS named color
  if (CSS_NAMED_COLORS[cleanName]) {
    return CSS_NAMED_COLORS[cleanName];
  }

  // 5. Parse rgb(...) or rgba(...)
  const rgbMatch = clean.match(/rgba?\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)));
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)));
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
      .toString(16)
      .padStart(2, "0")}`;
  }

  return fallback;
}

/**
 * Calculates a matching hover shade for a hex color.
 * By default, darkens by 12-15%, or lightens if the color is already very dark.
 */
export function getHoverColor(hex: string): string {
  const cleanHex = resolveToHex(hex);
  const r = parseInt(cleanHex.slice(1, 3), 16);
  const g = parseInt(cleanHex.slice(3, 5), 16);
  const b = parseInt(cleanHex.slice(5, 7), 16);

  // Compute perceived brightness: Y = 0.299 R + 0.587 G + 0.114 B
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

  if (brightness < 40) {
    // Very dark: lighten by 25%
    const nr = Math.min(255, Math.round(r + (255 - r) * 0.25));
    const ng = Math.min(255, Math.round(g + (255 - g) * 0.25));
    const nb = Math.min(255, Math.round(b + (255 - b) * 0.25));
    return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb
      .toString(16)
      .padStart(2, "0")}`;
  }

  // Normal / bright: darken by 14%
  const nr = Math.max(0, Math.round(r * 0.86));
  const ng = Math.max(0, Math.round(g * 0.86));
  const nb = Math.max(0, Math.round(b * 0.86));
  return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb
    .toString(16)
    .padStart(2, "0")}`;
}

/**
 * Returns an rgba() glow or shadow color string for a given hex color.
 */
export function getGlowColor(hex: string, alpha = 0.25): string {
  const cleanHex = resolveToHex(hex);
  const r = parseInt(cleanHex.slice(1, 3), 16);
  const g = parseInt(cleanHex.slice(3, 5), 16);
  const b = parseInt(cleanHex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export interface AccentTokens {
  color: string;
  hover: string;
  glow: string;
}

/**
 * Resolves full accent tokens (color, hover, glow) from any raw prop value.
 */
export function resolveAccentTokens(
  rawInput?: string | null,
  fallback = "#2724d1"
): AccentTokens {
  const color = resolveToHex(rawInput || "", fallback);
  const hover = getHoverColor(color);
  const glow = getGlowColor(color, 0.28);
  return { color, hover, glow };
}
