"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useInkBlobRouter } from "@/components/ink-blob-transition";
import { SketchCard, SketchButton, SketchBadge } from "@/components/sketch-ui";
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
  Terminal,
  Zap,
  CheckCircle2,
  FileCode,
  Heart,
  Cpu,
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
    <div className="min-h-screen bg-[#0c0e15] text-gray-100 flex flex-col font-mono selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        apiKeyMode={apiKeyMode}
        onApiKeyModeChange={handleApiKeyModeChange}
        customApiKey={customApiKey}
        onCustomApiKeyChange={handleCustomApiKeyChange}
      />

      <main className="flex-1">
        {/* Hero Section: Sketchbook Paper Theme */}
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Subtle Graph Paper Pattern */}
          <div className="absolute inset-0 bg-dot-matrix opacity-20 pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Hacktoberfest Track Badge */}
              <div className="inline-flex items-center gap-2 mb-6">
                <SketchBadge stroke="#818cf8" fill="rgba(99, 102, 241, 0.15)">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>Hacktoberfest 2026 Track: Gemma 4 31B</span>
                </SketchBadge>
              </div>

              {/* Hand-Drawn Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15] text-white">
                Turn Hand-Drawn{" "}
                <span className="relative inline-block text-indigo-400 underline decoration-wavy decoration-indigo-500/80 decoration-2">
                  Napkin Sketches
                </span>{" "}
                into Tailwind Components.
              </h1>

              {/* Subtitle */}
              <p className="mt-6 text-sm sm:text-base leading-relaxed text-gray-400 max-w-2xl mx-auto font-sans">
                Draw on our digital whiteboard or drop a real paper wireframe photo. Gemma 4 31B synthesizes clean, fully responsive Tailwind markup with instant sandbox preview and copyable code.
              </p>

              {/* Primary Sketchbook Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleLaunchPlayground}
                  className="group relative flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl border-2 border-indigo-400 bg-indigo-600 px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 transition-all hover:bg-indigo-500 hover:scale-105 active:scale-95"
                >
                  <PenTool className="size-4" />
                  <span>Launch Sketch Workbench →</span>
                </button>

                <a
                  href="https://github.com/Pierce05/sketch-to-kernel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-[#2b3044] bg-[#131520] px-6 py-3.5 text-sm font-bold text-gray-300 hover:border-indigo-500 hover:text-white transition-all shadow-md"
                >
                  <Code2 className="size-4" />
                  <span>View Repository</span>
                </a>
              </div>

              {/* Drawably Feature Pills */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs">
                <SketchBadge stroke="#6366f1">
                  ✏️ Freehand HTML5 Canvas
                </SketchBadge>
                <SketchBadge stroke="#a855f7">
                  📱 Touch &amp; Mobile Responsive
                </SketchBadge>
                <SketchBadge stroke="#ec4899">
                  ⚡ Tailwind Play CDN
                </SketchBadge>
                <SketchBadge stroke="#10b981">
                  🎛️ Live Two-Way Props
                </SketchBadge>
              </div>
            </div>

            {/* Interactive Napkin Showcase Mockup: Hackathon Theme */}
            <div className="mt-14 sm:mt-16 relative mx-auto max-w-5xl">
              <SketchCard
                roughness={1.4}
                stroke="#4f46e5"
                className="rounded-3xl border-2 border-indigo-500/40 bg-[#11131f]/90 p-3 sm:p-6 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-center justify-between border-b-2 border-[#232738] pb-3 text-xs text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="size-3 rounded-full bg-red-500/80" />
                    <span className="size-3 rounded-full bg-yellow-500/80" />
                    <span className="size-3 rounded-full bg-green-500/80" />
                    <span className="ml-2 font-mono text-gray-300">
                      sketch-to-kernel // hackathon-pipeline.draw
                    </span>
                  </div>
                  <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] text-indigo-300 border border-indigo-800">
                    Gemma 4 31B Pipeline
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
                  {/* Left Napkin: Hand-Drawn Sketch */}
                  <div className="flex flex-col rounded-2xl border-2 border-dashed border-indigo-500/50 bg-[#0c0e15] p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase tracking-wider">
                        1. Hand-Drawn Napkin Wireframe
                      </span>
                      <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] text-indigo-300 border border-indigo-800/40 font-mono">
                        Sketch Input
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center py-6 border-2 border-dashed border-gray-700/60 rounded-xl bg-[#08090e]">
                      <div className="w-full max-w-xs space-y-3 p-4 border-2 border-dashed border-indigo-400/60 rounded-xl font-mono text-xs text-indigo-200">
                        <div className="flex justify-between items-center border-b-2 border-indigo-400/50 pb-2">
                          <span className="font-bold">[ SketchToKernel ]</span>
                          <span className="text-[10px]">[ ★ 142 ]</span>
                        </div>
                        <div className="text-[11px] text-indigo-300/80">
                          Turn hand-drawn napkin wireframes into pure Tailwind components in seconds!
                        </div>
                        <div className="flex gap-1.5 text-[10px] text-indigo-400">
                          <span className="border border-indigo-500/40 px-1 rounded">[Next.js]</span>
                          <span className="border border-indigo-500/40 px-1 rounded">[Gemma 4]</span>
                        </div>
                        <div className="mt-2 h-7 rounded border-2 border-indigo-400 bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-200">
                          [ Explore Submission → ]
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Napkin: Compiled Live Tailwind Component */}
                  <div className="flex flex-col rounded-2xl border-2 border-indigo-500/50 bg-[#0c0e15] p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                        2. Compiled Sandboxed Component
                      </span>
                      <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-300 border border-emerald-800/40 font-mono">
                        Tailwind Output
                      </span>
                    </div>

                    <div className="flex-1 flex items-center justify-center py-4">
                      <div className="w-full max-w-xs rounded-2xl border-2 border-indigo-500/40 bg-gray-950 p-5 shadow-2xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-mono text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                              Hacktoberfest 2026
                            </span>
                            <h4 className="text-sm font-bold text-white mt-0.5">SketchToKernel</h4>
                          </div>
                          <span className="rounded-lg bg-emerald-950/80 px-2 py-0.5 text-[11px] font-mono text-emerald-400 border border-emerald-800/40">
                            ★ 142
                          </span>
                        </div>
                        <p className="mt-2.5 text-xs text-gray-400 leading-relaxed font-sans">
                          Turn hand-drawn napkin wireframes into pure Tailwind components in seconds!
                        </p>
                        <div className="mt-3 flex gap-1.5">
                          <span className="rounded bg-gray-900 border border-gray-800 px-1.5 py-0.5 text-[10px] text-indigo-300">Next.js 16</span>
                          <span className="rounded bg-gray-900 border border-gray-800 px-1.5 py-0.5 text-[10px] text-purple-300">Tailwind v4</span>
                          <span className="rounded bg-gray-900 border border-gray-800 px-1.5 py-0.5 text-[10px] text-pink-300">Gemma 4</span>
                        </div>
                        <button
                          onClick={handleLaunchPlayground}
                          className="mt-4 w-full rounded-xl bg-indigo-600 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
                        >
                          Try In Playground →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SketchCard>
            </div>
          </div>
        </section>

        {/* 3 Core Architected Cards (Drawably Hand-Drawn Theme) */}
        <section className="relative border-t-2 border-[#232738] bg-[#090b12] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400">
                Hacktoberfest 2026 Architecture
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                Built Like A Digital Sketchbook
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1 */}
              <SketchCard
                roughness={1.5}
                stroke="#6366f1"
                className="rounded-2xl border-2 border-[#2b3044] bg-[#111320] p-6 transition-all hover:scale-102"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-950 text-indigo-400 border border-indigo-800 mb-5">
                  <PenTool className="size-5" />
                </div>
                <h3 className="text-base font-bold text-white font-mono">
                  Dual-Mode Drawing Board
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400 font-sans">
                  Draw continuous 60fps solid strokes with mouse, Apple Pencil, or mobile touch. Includes Drawably stamps and paper napkin photo upload dropzone.
                </p>
              </SketchCard>

              {/* Card 2 */}
              <SketchCard
                roughness={1.5}
                stroke="#a855f7"
                className="rounded-2xl border-2 border-[#2b3044] bg-[#111320] p-6 transition-all hover:scale-102"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-purple-950 text-purple-400 border border-purple-800 mb-5">
                  <Zap className="size-5" />
                </div>
                <h3 className="text-base font-bold text-white font-mono">
                  Gemma 4 31B Synthesis
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400 font-sans">
                  Direct inference pipeline with strict Zod schema validation. Produces pure Tailwind markup with detected customizable variable slots.
                </p>
              </SketchCard>

              {/* Card 3 */}
              <SketchCard
                roughness={1.5}
                stroke="#ec4899"
                className="rounded-2xl border-2 border-[#2b3044] bg-[#111320] p-6 transition-all hover:scale-102"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-pink-950 text-pink-400 border border-pink-800 mb-5">
                  <Sliders className="size-5" />
                </div>
                <h3 className="text-base font-bold text-white font-mono">
                  Live Sandbox &amp; 2-Way Props
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-gray-400 font-sans">
                  Isolated iframe runner injecting Tailwind Play CDN. Editing prop variables immediately re-renders the live component in real time.
                </p>
              </SketchCard>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <SketchCard
              roughness={1.8}
              stroke="#4f46e5"
              className="rounded-3xl border-2 border-indigo-500/50 bg-[#121422] p-8 sm:p-12 text-center shadow-2xl"
            >
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Ready to sketch your Hacktoberfest component?
              </h3>
              <p className="mt-3 text-xs sm:text-sm text-gray-400 max-w-lg mx-auto font-sans">
                Open the interactive workbench, test our sample hackathon wireframes, or doodle your own napkin sketch and compile with Gemma 4 31B.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleLaunchPlayground}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-400 bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-xl hover:bg-indigo-500 transition-all hover:scale-105"
                >
                  <span>Open Workbench Now →</span>
                </button>
              </div>
            </SketchCard>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#232738] bg-[#08090e] py-8 text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-300">SketchToKernel</span>
            <span>•</span>
            <span>Hacktoberfest 2026 Open Source Project</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Pierce05/sketch-to-kernel"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              GitHub Repo
            </a>
            <a
              href="https://github.com/Pierce05/sketch-to-kernel/issues/2"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              Issue #2
            </a>
            <a
              href="https://github.com/Pierce05/sketch-to-kernel/pull/5"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-indigo-400 transition-colors"
            >
              PR #5
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
