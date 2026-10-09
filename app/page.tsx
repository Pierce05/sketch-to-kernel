"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useInkBlobRouter } from "@/components/ink-blob-transition";
import {
  SketchCard,
  SketchButton,
  SketchBadge,
  SketchHighlight,
  SketchUnderline,
} from "@/components/sketch-ui";
import { ApiKeyMode } from "@/lib/types";
import { STORAGE_CUSTOM_KEY, STORAGE_KEY_MODE } from "@/lib/utils";
import {
  PenTool,
  Sparkles,
  ArrowRight,
  Code2,
  Sliders,
  Smartphone,
  Eye,
  CheckCircle2,
  Zap,
  Layers,
  Heart,
  Palette,
} from "lucide-react";

export default function LandingPage() {
  const { navigateWithBlob } = useInkBlobRouter();
  const [apiKeyMode, setApiKeyMode] = useState<ApiKeyMode>("default_1");
  const [customApiKey, setCustomApiKey] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ApiKeyMode;
      if (savedMode) setApiKeyMode(savedMode);
      const savedKey = localStorage.getItem(STORAGE_CUSTOM_KEY);
      if (savedKey) setCustomApiKey(savedKey);
    }
  }, []);

  const handleApiKeyModeChange = (mode: ApiKeyMode) => {
    setApiKeyMode(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_MODE, mode);
    }
  };

  const handleCustomApiKeyChange = (key: string) => {
    setCustomApiKey(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_KEY, key);
    }
  };

  const handleLaunchPlayground = (e: React.MouseEvent) => {
    e.preventDefault();
    navigateWithBlob("/playground", { x: e.clientX, y: e.clientY });
  };

  return (
    <div className="min-h-screen bg-[#f6f5f0] text-[#18181b] flex flex-col font-sans selection:bg-[#fef08a] selection:text-[#18181b]">
      {/* Top Navbar */}
      <Navbar
        apiKeyMode={apiKeyMode}
        onApiKeyModeChange={handleApiKeyModeChange}
        customApiKey={customApiKey}
        onCustomApiKeyChange={handleCustomApiKeyChange}
      />

      <main className="flex-1 bg-sketchbook-grid">
        {/* Hero Section: Authentic Sketchbook Paper */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Hacktoberfest Track Badge */}
              <div className="inline-flex items-center gap-2 mb-6">
                <SketchBadge
                  stroke="#2724d1"
                  fill="rgba(39, 36, 209, 0.08)"
                  className="text-xs text-[#2724d1] font-bold"
                >
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                  <span>Hacktoberfest 2026 • Gemma 4 31B Track</span>
                </SketchBadge>
              </div>

              {/* Hand-Drawn Headline with Drawably aesthetic */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15] text-[#18181b]">
                Turn Hand-Drawn{" "}
                <span className="relative inline-block font-pen text-5xl sm:text-7xl text-[#2724d1]">
                  Napkin Sketches
                </span>{" "}
                into Tailwind Components.
              </h1>

              {/* Subhead */}
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#52525b] max-w-2xl mx-auto">
                Powered by <strong className="text-[#18181b]">Gemma 4 31B</strong>. Doodle on our digital napkin canvas or drop a real paper wireframe photo to get an instant live sandboxed component and copyable Tailwind code.
              </p>

              {/* Primary Sketchbook Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <SketchButton
                  variant="primary"
                  onClick={handleLaunchPlayground}
                  className="w-full sm:w-auto text-sm py-3 px-8 text-white font-bold shadow-lg"
                >
                  <PenTool className="size-4" />
                  <span>Launch Playground →</span>
                </SketchButton>

                <a
                  href="https://github.com/Pierce05/sketch-to-kernel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <SketchButton
                    variant="secondary"
                    className="w-full sm:w-auto text-sm py-3 px-6 text-[#18181b] font-semibold"
                  >
                    <Code2 className="size-4" />
                    <span>View Repository</span>
                  </SketchButton>
                </a>
              </div>

              {/* Drawably / Rough Feature Pills */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs">
                <SketchBadge stroke="#2724d1" fill="rgba(39, 36, 209, 0.06)">
                  ✏️ HTML5 Freehand Canvas
                </SketchBadge>
                <SketchBadge stroke="#7c3aed" fill="rgba(124, 58, 237, 0.06)">
                  📱 Mobile &amp; Touch Friendly
                </SketchBadge>
                <SketchBadge stroke="#d12724" fill="rgba(209, 39, 36, 0.06)">
                  ⚡ Live Tailwind Play CDN
                </SketchBadge>
                <SketchBadge stroke="#188a42" fill="rgba(24, 138, 66, 0.06)">
                  🎛️ Live Two-Way Props
                </SketchBadge>
              </div>
            </div>

            {/* Interactive Napkin Showcase Mockup: Hackathon Theme */}
            <div className="mt-14 sm:mt-16 relative mx-auto max-w-5xl">
              <SketchCard
                roughness={1.5}
                stroke="#18181b"
                fill="#ffffff"
                className="rounded-3xl p-4 sm:p-7 shadow-2xl"
              >
                {/* Header line */}
                <div className="flex items-center justify-between border-b-2 border-[#18181b] pb-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full border border-[#18181b] bg-[#f87171]" />
                    <span className="size-3 rounded-full border border-[#18181b] bg-[#fde047]" />
                    <span className="size-3 rounded-full border border-[#18181b] bg-[#4ade80]" />
                    <span className="ml-2 font-bold text-[#18181b]">
                      sketchbook://hackathon-submission-napkin.draw
                    </span>
                  </div>
                  <SketchBadge
                    stroke="#2724d1"
                    className="text-[10px] text-[#2724d1] font-bold"
                  >
                    Gemma 4 31B Pipeline
                  </SketchBadge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                  {/* Left Napkin: Hand-Drawn Sketch */}
                  <div className="flex flex-col rounded-2xl border-2 border-dashed border-[#2724d1]/70 bg-[#faf9f5] p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-[#2724d1] uppercase tracking-wider">
                        1. Hand-Drawn Napkin Wireframe
                      </span>
                      <span className="rounded border border-[#2724d1] bg-blue-50 px-2 py-0.5 text-[10px] font-mono text-[#2724d1] font-bold">
                        Sketch Input
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center py-6 border-2 border-dashed border-[#71717a]/50 rounded-xl bg-white">
                      {/* Hand-drawn representation */}
                      <div className="w-full max-w-xs space-y-3 p-4 border-2 border-dashed border-[#2724d1] rounded-xl font-mono text-xs text-[#2724d1]">
                        <div className="flex justify-between items-center border-b-2 border-[#2724d1] pb-2 font-bold">
                          <span>[ Sketch2UI ]</span>
                          <span className="text-[10px]">[ ★ 142 ]</span>
                        </div>
                        <div className="text-[11px] text-[#18181b] leading-tight">
                          Turn hand-drawn napkin wireframes into pure Tailwind components in seconds!
                        </div>
                        <div className="flex gap-1.5 text-[10px]">
                          <span className="border border-[#2724d1] px-1 rounded">[Next.js 16]</span>
                          <span className="border border-[#2724d1] px-1 rounded">[Gemma 4]</span>
                        </div>
                        <div className="mt-2 h-7 rounded border-2 border-[#2724d1] bg-blue-100/60 flex items-center justify-center font-bold text-[#2724d1]">
                          [ Explore Submission → ]
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Napkin: Compiled Live Tailwind Component */}
                  <div className="flex flex-col rounded-2xl border-2 border-[#188a42]/80 bg-[#faf9f5] p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-[#188a42] uppercase tracking-wider">
                        2. Compiled Sandboxed Component
                      </span>
                      <span className="rounded border border-[#188a42] bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-[#188a42] font-bold">
                        Tailwind Output
                      </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center py-4">
                      <div className="w-full max-w-xs rounded-2xl border-2 border-[#18181b] bg-white p-5 shadow-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-[10px] font-bold text-[#2724d1] uppercase tracking-wider">
                              Hacktoberfest 2026
                            </span>
                            <h4 className="text-sm font-bold text-[#18181b] mt-0.5">
                              Sketch2UI
                            </h4>
                          </div>
                          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-mono text-[#188a42] font-bold border border-emerald-300">
                            ★ 142
                          </span>
                        </div>
                        <p className="mt-2.5 text-xs text-[#52525b] leading-relaxed">
                          Turn hand-drawn napkin wireframes into pure Tailwind components in seconds!
                        </p>
                        <div className="mt-3 flex gap-1.5 font-mono">
                          <span className="rounded bg-gray-100 border border-gray-300 px-1.5 py-0.5 text-[10px] text-[#2724d1]">
                            Next.js 16
                          </span>
                          <span className="rounded bg-gray-100 border border-gray-300 px-1.5 py-0.5 text-[10px] text-purple-700">
                            Tailwind v4
                          </span>
                          <span className="rounded bg-gray-100 border border-gray-300 px-1.5 py-0.5 text-[10px] text-pink-700">
                            Gemma 4
                          </span>
                        </div>
                        <SketchButton
                          variant="primary"
                          onClick={handleLaunchPlayground}
                          className="mt-4 w-full text-xs font-bold py-2 shadow-md"
                        >
                          Try In Playground →
                        </SketchButton>
                      </div>
                    </div>
                  </div>
                </div>
              </SketchCard>
            </div>
          </div>
        </section>

        {/* 3 Core Architected Cards (Drawably & Rough Hand-Drawn Theme) */}
        <section className="relative border-t-2 border-[#18181b] bg-[#eceae1] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2724d1]">
                Hacktoberfest 2026 Architecture
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#18181b] sm:text-4xl">
                Built Like A Digital Sketchbook
              </h2>
              <p className="mt-2 text-sm text-[#52525b]">
                Hover any card to see fresh hand-drawn pen strokes re-sketch automatically!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature Card 1 */}
              <SketchCard
                roughness={1.5}
                stroke="#2724d1"
                fill="#ffffff"
                className="p-6 transition-all hover:scale-102 rounded-2xl"
              >
                <div className="flex size-11 items-center justify-center rounded-xl border-2 border-[#2724d1] bg-blue-50 text-[#2724d1] mb-5 shadow-xs">
                  <PenTool className="size-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-[#18181b] font-mono">
                  Dual-Mode Drawing Board
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#52525b]">
                  Continuous 60fps solid strokes with mouse, Apple Pencil, or mobile touch. Includes draggable Drawably element stamps and real napkin photo upload.
                </p>
              </SketchCard>

              {/* Feature Card 2 */}
              <SketchCard
                roughness={1.5}
                stroke="#7c3aed"
                fill="#ffffff"
                className="p-6 transition-all hover:scale-102 rounded-2xl"
              >
                <div className="flex size-11 items-center justify-center rounded-xl border-2 border-[#7c3aed] bg-purple-50 text-[#7c3aed] mb-5 shadow-xs">
                  <Zap className="size-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-[#18181b] font-mono">
                  Gemma 4 31B Synthesis
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#52525b]">
                  Direct multimodal inference pipeline with strict Zod schema validation. Produces pure semantic Tailwind markup with detected variable slots.
                </p>
              </SketchCard>

              {/* Feature Card 3 */}
              <SketchCard
                roughness={1.5}
                stroke="#188a42"
                fill="#ffffff"
                className="p-6 transition-all hover:scale-102 rounded-2xl"
              >
                <div className="flex size-11 items-center justify-center rounded-xl border-2 border-[#188a42] bg-emerald-50 text-[#188a42] mb-5 shadow-xs">
                  <Sliders className="size-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-[#18181b] font-mono">
                  Live Sandbox &amp; 2-Way Props
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#52525b]">
                  Isolated iframe runner injecting Tailwind Play CDN. Editing prop variables immediately re-renders the live component in real time.
                </p>
              </SketchCard>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative py-16 sm:py-20 overflow-hidden bg-[#f6f5f0]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SketchCard
              roughness={1.6}
              stroke="#18181b"
              fill="#ffffff"
              className="p-8 sm:p-12 text-center shadow-xl rounded-3xl"
            >
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#18181b]">
                Ready to sketch your Hacktoberfest component?
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-[#52525b] max-w-lg mx-auto">
                Open the interactive workbench, test our ready hackathon napkin presets, or doodle your own wireframe and compile with Gemma 4 31B.
              </p>
              <div className="mt-6 flex justify-center">
                <SketchButton
                  variant="primary"
                  onClick={handleLaunchPlayground}
                  className="text-sm py-3 px-8 text-white font-bold"
                >
                  <span>Launch Playground Now →</span>
                </SketchButton>
              </div>
            </SketchCard>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#18181b] bg-[#eceae1] py-8 text-xs text-[#52525b]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#18181b]">Sketch2UI</span>
            <span>•</span>
            <span>Hacktoberfest 2026 Open Source Project</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Pierce05/sketch-to-kernel"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2724d1] transition-colors"
            >
              GitHub Repo
            </a>
            <a
              href="https://github.com/Pierce05/sketch-to-kernel/issues/2"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2724d1] transition-colors"
            >
              Issue #2
            </a>
            <a
              href="https://github.com/Pierce05/sketch-to-kernel/pull/5"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2724d1] transition-colors"
            >
              PR #5
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
