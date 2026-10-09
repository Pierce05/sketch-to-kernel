"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { useInkBlobRouter } from "@/components/ink-blob-transition";
import { ApiKeyMode } from "@/lib/types";
import { STORAGE_CUSTOM_KEY, STORAGE_KEY_MODE } from "@/lib/utils";
import {
  PenTool,
  Sparkles,
  Layers,
  ArrowRight,
  Code2,
  Sliders,
  Smartphone,
  Eye,
  CheckCircle2,
  Terminal,
  Cpu,
  Zap,
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
    <div className="min-h-screen bg-[#090a0f] text-gray-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        apiKeyMode={apiKeyMode}
        onApiKeyModeChange={handleApiKeyModeChange}
        customApiKey={customApiKey}
        onCustomApiKeyChange={handleCustomApiKeyChange}
      />

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
          {/* Ambient Glow & Dot Matrix Grid */}
          <div className="absolute inset-0 bg-dot-matrix opacity-40 pointer-events-none" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[500px] sm:size-[700px] rounded-full bg-gradient-to-tr from-indigo-600/15 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              {/* Hacktoberfest & Gemma Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-3.5 py-1 text-xs font-medium text-indigo-300 shadow-sm backdrop-blur-sm mb-6 animate-in fade-in slide-in-from-top-3 duration-500">
                <span className="flex size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hacktoberfest 2026 Open Source Project</span>
                <span className="text-gray-500">•</span>
                <span className="font-mono text-purple-300">Gemma 4 31B</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.12] text-white">
                Turn Hand-Drawn Napkin Sketches into{" "}
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Tailwind Components
                </span>{" "}
                in Seconds.
              </h1>

              {/* Subhead */}
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-gray-400 max-w-2xl mx-auto">
                Powered by Gemma 4 31B. Draw on canvas or snap a paper wireframe to get an instant live sandboxed component and copyable code.
              </p>

              {/* Primary Actions */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={handleLaunchPlayground}
                  className="group relative inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] hover:shadow-indigo-600/50 active:scale-[0.98]"
                >
                  <span>Launch Playground</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>

                <a
                  href="https://github.com/Pierce05/sketch-to-kernel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-[#2b3044] bg-[#11131b]/80 px-6 py-3.5 text-sm font-medium text-gray-300 transition-colors hover:border-[#3f4664] hover:text-white backdrop-blur-sm"
                >
                  <Code2 className="size-4 text-gray-400" />
                  <span>Explore Repository</span>
                </a>
              </div>

              {/* Quick Feature Badges (Drawably Aesthetic) */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#2b3044] bg-[#11131b]/60 px-3 py-1 font-mono">
                  <PenTool className="size-3 text-indigo-400" /> Freehand Canvas
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#2b3044] bg-[#11131b]/60 px-3 py-1 font-mono">
                  <Smartphone className="size-3 text-purple-400" /> Mobile Touch Support
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#2b3044] bg-[#11131b]/60 px-3 py-1 font-mono">
                  <Eye className="size-3 text-pink-400" /> Tailwind Play CDN
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#2b3044] bg-[#11131b]/60 px-3 py-1 font-mono">
                  <Sliders className="size-3 text-emerald-400" /> Live Two-Way Props
                </span>
              </div>
            </div>

            {/* Visual Teaser Mockup: Napkin to Clean Component */}
            <div className="mt-14 sm:mt-16 relative mx-auto max-w-5xl rounded-2xl border border-[#2b3044] bg-[#11131b]/80 p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-[#232738] px-3 py-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="size-3 rounded-full bg-red-500/80" />
                  <div className="size-3 rounded-full bg-yellow-500/80" />
                  <div className="size-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-[11px] text-gray-400">
                    sketch-to-kernel // live preview
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px] text-indigo-300">
                  <span className="size-2 rounded-full bg-indigo-500 animate-ping" />
                  Gemma 4 31B Pipeline
                </div>
              </div>

              {/* Split Teaser Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 sm:p-6">
                {/* Left: Hand-drawn Napkin Wireframe Card */}
                <div className="flex flex-col rounded-xl border border-dashed border-indigo-500/30 bg-[#0c0e15] p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-medium text-indigo-400 uppercase tracking-wider">
                      1. Napkin Wireframe Sketch
                    </span>
                    <span className="rounded bg-indigo-950/60 px-2 py-0.5 text-[10px] font-mono text-indigo-300 border border-indigo-800/40">
                      Input
                    </span>
                  </div>

                  {/* Simulated Sketch Canvas */}
                  <div className="flex-1 flex flex-col justify-center items-center py-6 border border-dashed border-gray-700/60 rounded-lg bg-[#090a0f]/60 relative">
                    <div className="w-full max-w-xs space-y-3 p-4 border-2 border-dashed border-indigo-400/40 rounded-xl font-mono text-xs text-indigo-200">
                      <div className="h-6 w-3/4 border-b-2 border-indigo-400/50 font-bold flex items-center">
                        [ Pricing Plan ]
                      </div>
                      <div className="h-8 border-2 border-dashed border-indigo-400/30 rounded flex items-center justify-center text-indigo-300 text-sm font-bold">
                        $29 / mo
                      </div>
                      <div className="space-y-1.5 text-[11px] text-indigo-300/70">
                        <div className="flex items-center gap-1.5">
                          <span>✓</span> Unlimited Sketches
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>✓</span> Gemma 4 31B Inference
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span>✓</span> Instant Tailwind Output
                        </div>
                      </div>
                      <div className="h-7 rounded border border-indigo-400/60 bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-200">
                        [ Subscribe CTA ]
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Compiled Live Tailwind Card */}
                <div className="flex flex-col rounded-xl border border-indigo-500/30 bg-[#0c0e15] p-5 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-medium text-emerald-400 uppercase tracking-wider">
                      2. Compiled Sandboxed Component
                    </span>
                    <span className="rounded bg-emerald-950/60 px-2 py-0.5 text-[10px] font-mono text-emerald-300 border border-emerald-800/40">
                      Tailwind Output
                    </span>
                  </div>

                  {/* Live Rendered Component */}
                  <div className="flex-1 flex items-center justify-center py-4">
                    <div className="w-full max-w-xs rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-5 shadow-xl">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">Pro Plan</h4>
                        <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-300">
                          Popular
                        </span>
                      </div>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-white">$29</span>
                        <span className="text-xs text-gray-400">/month</span>
                      </div>
                      <ul className="mt-4 space-y-2 text-xs text-gray-300">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-400" /> Unlimited Sketches
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-400" /> Gemma 4 31B Inference
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-emerald-400" /> Instant Tailwind Output
                        </li>
                      </ul>
                      <button
                        onClick={handleLaunchPlayground}
                        className="mt-5 w-full rounded-xl bg-indigo-600 py-2 text-xs font-medium text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-500 transition-colors"
                      >
                        Try In Playground →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Section: 3 Core Cards */}
        <section className="relative border-t border-[#232738] bg-[#0c0e15]/60 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-400">
                Architected For Speed & Precision
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Engineered for Hackathons and Production Workflows
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Interactive Canvas */}
              <div className="flex flex-col rounded-2xl border border-[#232738] bg-[#11131b] p-6 transition-all hover:border-indigo-500/40 hover:shadow-xl">
                <div className="flex size-11 items-center justify-center rounded-xl bg-indigo-950/80 text-indigo-400 border border-indigo-800/40 mb-5">
                  <PenTool className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Interactive HTML5 Canvas</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Full pointer event support for mouse, stylus, and mobile touch. Includes pen, eraser, line width controls, Drawably stamps, and instant drag-and-drop file upload for napkin wireframe photos.
                </p>
                <div className="mt-4 pt-4 border-t border-[#232738] text-xs font-mono text-indigo-400 flex items-center gap-1.5">
                  <Smartphone className="size-3.5" /> Touch + Pen + Photo Drop
                </div>
              </div>

              {/* Card 2: Live Tailwind Sandbox */}
              <div className="flex flex-col rounded-2xl border border-[#232738] bg-[#11131b] p-6 transition-all hover:border-purple-500/40 hover:shadow-xl">
                <div className="flex size-11 items-center justify-center rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/40 mb-5">
                  <Zap className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Live In-Browser Sandbox</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Runs compiled components inside an isolated iframe injected with the Tailwind Play CDN. Renders flexboxes, grids, gradients, and responsive breakpoints instantly without local build waits.
                </p>
                <div className="mt-4 pt-4 border-t border-[#232738] text-xs font-mono text-purple-400 flex items-center gap-1.5">
                  <Eye className="size-3.5" /> Isolated Iframe Runner
                </div>
              </div>

              {/* Card 3: Dynamic Prop Discovery */}
              <div className="flex flex-col rounded-2xl border border-[#232738] bg-[#11131b] p-6 transition-all hover:border-pink-500/40 hover:shadow-xl">
                <div className="flex size-11 items-center justify-center rounded-xl bg-pink-950/80 text-pink-400 border border-pink-800/40 mb-5">
                  <Sliders className="size-5" />
                </div>
                <h3 className="text-lg font-semibold text-white">Dynamic Prop Discovery</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  Automatically extracts customizable component properties and slots. Provides an interactive live table where editing prop values dynamically updates the sandboxed component in real time.
                </p>
                <div className="mt-4 pt-4 border-t border-[#232738] text-xs font-mono text-pink-400 flex items-center gap-1.5">
                  <Sliders className="size-3.5" /> 2-Way Live Customizer
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="relative py-16 sm:py-20 overflow-hidden">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900 p-8 sm:p-12 text-center relative shadow-2xl">
              <h3 className="text-2xl sm:text-3xl font-bold text-white">
                Ready to turn your napkin sketches into real components?
              </h3>
              <p className="mt-3 text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
                No sign-up required. Launch the workbench, test sample wireframes with Gemma 4 31B, and export pure Tailwind code.
              </p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleLaunchPlayground}
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-gray-950 shadow-md hover:bg-gray-100 transition-all hover:scale-105"
                >
                  <span>Launch Playground Now</span>
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#232738] bg-[#07080c] py-8 text-xs text-gray-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-300">SketchToKernel</span>
            <span>•</span>
            <span>Hacktoberfest 2026 Open Source Project</span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Pierce05/sketch-to-kernel"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://github.com/Pierce05/sketch-to-kernel/issues/2"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              Issue #2
            </a>
            <a
              href="https://github.com/Pierce05/sketch-to-kernel/pull/5"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-300 transition-colors"
            >
              PR #5
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
