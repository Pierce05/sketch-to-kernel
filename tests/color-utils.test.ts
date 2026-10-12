import { describe, it, expect } from "vitest";
import {
  isColorProp,
  resolveToHex,
  getHoverColor,
  getGlowColor,
  resolveAccentTokens,
  TAILWIND_COLORS,
} from "@/lib/color-utils";

describe("isColorProp", () => {
  it("identifies color and accent prop names", () => {
    expect(isColorProp("accentColor")).toBe(true);
    expect(isColorProp("accent")).toBe(true);
    expect(isColorProp("primaryColor")).toBe(true);
    expect(isColorProp("themeColor")).toBe(true);
    expect(isColorProp("buttonColor")).toBe(true);
    expect(isColorProp("btnColor")).toBe(true);
    expect(isColorProp("buttonBg")).toBe(true);
    expect(isColorProp("color")).toBe(true);
    expect(isColorProp("brandColor")).toBe(true);
  });

  it("identifies props with type 'color'", () => {
    expect(isColorProp("customSlot", "color")).toBe(true);
    expect(isColorProp("myVariable", "Color")).toBe(true);
  });

  it("rejects non-color prop names", () => {
    expect(isColorProp("title")).toBe(false);
    expect(isColorProp("authorName")).toBe(false);
    expect(isColorProp("starsCount")).toBe(false);
    expect(isColorProp("latency")).toBe(false);
    expect(isColorProp("description")).toBe(false);
  });
});

describe("resolveToHex", () => {
  it("normalizes hex colors", () => {
    expect(resolveToHex("#fff")).toBe("#ffffff");
    expect(resolveToHex("#123")).toBe("#112233");
    expect(resolveToHex("#4f46e5")).toBe("#4f46e5");
    expect(resolveToHex("#4F46E5")).toBe("#4f46e5");
  });

  it("resolves Tailwind color names to hex codes", () => {
    expect(resolveToHex("indigo-600")).toBe(TAILWIND_COLORS["indigo-600"]);
    expect(resolveToHex("blue-500")).toBe(TAILWIND_COLORS["blue-500"]);
    expect(resolveToHex("emerald")).toBe(TAILWIND_COLORS["emerald"]);
    expect(resolveToHex("brand")).toBe("#2724d1");
  });

  it("strips utility prefixes like bg- or text-", () => {
    expect(resolveToHex("bg-indigo-600")).toBe(TAILWIND_COLORS["indigo-600"]);
    expect(resolveToHex("text-emerald-500")).toBe(TAILWIND_COLORS["emerald-500"]);
    expect(resolveToHex("[#ef4444]")).toBe("#ef4444");
  });

  it("resolves CSS and Tailwind named colors", () => {
    expect(resolveToHex("red")).toBe("#dc2626");
    expect(resolveToHex("blue")).toBe("#2563eb");
    expect(resolveToHex("green")).toBe("#16a34a");
    expect(resolveToHex("purple")).toBe("#9333ea");
    expect(resolveToHex("coral")).toBe("#f87171");
    expect(resolveToHex("navy")).toBe("#1e3a8a");
  });

  it("resolves rgb strings to hex", () => {
    expect(resolveToHex("rgb(79, 70, 229)")).toBe("#4f46e5");
  });

  it("returns fallback for invalid inputs", () => {
    expect(resolveToHex("", "#2724d1")).toBe("#2724d1");
    expect(resolveToHex("not-a-color", "#2724d1")).toBe("#2724d1");
  });
});

describe("getHoverColor and getGlowColor", () => {
  it("computes darker hover shade for standard colors", () => {
    const hover = getHoverColor("#3b82f6");
    expect(hover).toMatch(/^#[0-9a-f]{6}$/);
    expect(hover).not.toBe("#3b82f6");
  });

  it("computes lighter hover shade for very dark colors", () => {
    const hover = getHoverColor("#050505");
    expect(hover).toMatch(/^#[0-9a-f]{6}$/);
    expect(hover).not.toBe("#050505");
  });

  it("generates valid rgba glow string", () => {
    const glow = getGlowColor("#4f46e5", 0.3);
    expect(glow).toBe("rgba(79, 70, 229, 0.3)");
  });
});

describe("resolveAccentTokens", () => {
  it("returns comprehensive accent token bundle", () => {
    const tokens = resolveAccentTokens("indigo-600");
    expect(tokens.color).toBe("#4f46e5");
    expect(tokens.hover).toMatch(/^#[0-9a-f]{6}$/);
    expect(tokens.glow).toContain("rgba(79, 70, 229,");
  });
});
