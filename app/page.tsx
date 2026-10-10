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
import { ApiKeyMode, CustomProvider } from "@/lib/types";
import {
  STORAGE_CUSTOM_KEY,
  STORAGE_KEY_MODE,
  STORAGE_CUSTOM_PROVIDER,
  STORAGE_CUSTOM_MODEL,
  STORAGE_CUSTOM_ENDPOINT,
  STORAGE_CUSTOM_THINKING,
  STORAGE_CUSTOM_KEY_GEMINI,
  STORAGE_CUSTOM_KEY_NVIDIA,
  STORAGE_CUSTOM_KEY_ENDPOINT,
  STORAGE_CUSTOM_MODEL_NVIDIA,
  STORAGE_CUSTOM_MODEL_ENDPOINT,
} from "@/lib/utils";
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
  Cpu,
  Globe,
  ShieldCheck,
  Undo2,
  Redo2,
  Image as ImageIcon,
  Play,
} from "lucide-react";

export default function LandingPage() {
  const { navigateWithBlob } = useInkBlobRouter();
  const [apiKeyMode, setApiKeyMode] = useState<ApiKeyMode>("default_1");
  const [customApiKey, setCustomApiKey] = useState("");
  const [customProvider, setCustomProvider] = useState<CustomProvider>("gemini");
  const [customModelId, setCustomModelId] = useState("z-ai/glm-5.3");
  const [customEndpoint, setCustomEndpoint] = useState("https://api.openai.com/v1/chat/completions");
  const [customThinking, setCustomThinking] = useState(false);
  const [customKeyGemini, setCustomKeyGemini] = useState("");
  const [customKeyNvidia, setCustomKeyNvidia] = useState("");
  const [customKeyEndpoint, setCustomKeyEndpoint] = useState("");
  const [customModelNvidia, setCustomModelNvidia] = useState("meta/llama-3.1-70b-instruct");
  const [customModelEndpoint, setCustomModelEndpoint] = useState("gpt-4o");

  // Showcase Gallery Active Tab
  const [activeShowcaseTab, setActiveShowcaseTab] = useState<
    "canvas" | "models" | "sandbox" | "props"
  >("canvas");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMode = localStorage.getItem(STORAGE_KEY_MODE) as ApiKeyMode;
      if (savedMode) setApiKeyMode(savedMode);
      const savedKey = localStorage.getItem(STORAGE_CUSTOM_KEY);
      if (savedKey) setCustomApiKey(savedKey);
      const savedProvider = localStorage.getItem(STORAGE_CUSTOM_PROVIDER) as CustomProvider;
      if (savedProvider) setCustomProvider(savedProvider);
      const savedModel = localStorage.getItem(STORAGE_CUSTOM_MODEL);
      if (savedModel) setCustomModelId(savedModel);
      const savedEndpoint = localStorage.getItem(STORAGE_CUSTOM_ENDPOINT);
      if (savedEndpoint) setCustomEndpoint(savedEndpoint);
      const savedThinking = localStorage.getItem(STORAGE_CUSTOM_THINKING);
      if (savedThinking !== null) setCustomThinking(savedThinking === "true");

      const savedKeyGemini = localStorage.getItem(STORAGE_CUSTOM_KEY_GEMINI);
      if (savedKeyGemini) setCustomKeyGemini(savedKeyGemini);
      const savedKeyNvidia = localStorage.getItem(STORAGE_CUSTOM_KEY_NVIDIA);
      if (savedKeyNvidia) setCustomKeyNvidia(savedKeyNvidia);
      const savedKeyEndpoint = localStorage.getItem(STORAGE_CUSTOM_KEY_ENDPOINT);
      if (savedKeyEndpoint) setCustomKeyEndpoint(savedKeyEndpoint);

      const savedModelNvidia = localStorage.getItem(STORAGE_CUSTOM_MODEL_NVIDIA);
      if (savedModelNvidia) setCustomModelNvidia(savedModelNvidia);
      const savedModelEndpoint = localStorage.getItem(STORAGE_CUSTOM_MODEL_ENDPOINT);
      if (savedModelEndpoint) setCustomModelEndpoint(savedModelEndpoint);
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

  const handleCustomProviderChange = (provider: CustomProvider) => {
    setCustomProvider(provider);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_PROVIDER, provider);
    }
  };

  const handleCustomModelIdChange = (model: string) => {
    setCustomModelId(model);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_MODEL, model);
    }
  };

  const handleCustomEndpointChange = (endpoint: string) => {
    setCustomEndpoint(endpoint);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_ENDPOINT, endpoint);
    }
  };

  const handleCustomThinkingChange = (thinking: boolean) => {
    setCustomThinking(thinking);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_THINKING, String(thinking));
    }
  };

  const handleCustomKeyGeminiChange = (key: string) => {
    setCustomKeyGemini(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_KEY_GEMINI, key);
    }
  };

  const handleCustomKeyNvidiaChange = (key: string) => {
    setCustomKeyNvidia(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_KEY_NVIDIA, key);
    }
  };

  const handleCustomKeyEndpointChange = (key: string) => {
    setCustomKeyEndpoint(key);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_KEY_ENDPOINT, key);
    }
  };

  const handleCustomModelNvidiaChange = (model: string) => {
    setCustomModelNvidia(model);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_MODEL_NVIDIA, model);
    }
  };

  const handleCustomModelEndpointChange = (model: string) => {
    setCustomModelEndpoint(model);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_MODEL_ENDPOINT, model);
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
        customProvider={customProvider}
        onCustomProviderChange={handleCustomProviderChange}
        customModelId={customModelId}
        onCustomModelIdChange={handleCustomModelIdChange}
        customEndpoint={customEndpoint}
        onCustomEndpointChange={handleCustomEndpointChange}
        customThinking={customThinking}
        onCustomThinkingChange={handleCustomThinkingChange}
        customKeyGemini={customKeyGemini}
        onCustomKeyGeminiChange={handleCustomKeyGeminiChange}
        customKeyNvidia={customKeyNvidia}
        onCustomKeyNvidiaChange={handleCustomKeyNvidiaChange}
        customKeyEndpoint={customKeyEndpoint}
        onCustomKeyEndpointChange={handleCustomKeyEndpointChange}
        customModelNvidia={customModelNvidia}
        onCustomModelNvidiaChange={handleCustomModelNvidiaChange}
        customModelEndpoint={customModelEndpoint}
        onCustomModelEndpointChange={handleCustomModelEndpointChange}
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

              {/* Hand-Drawn Headline */}
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl sm:leading-[1.15] text-[#18181b]">
                Turn Hand-Drawn{" "}
                <span className="relative inline-block font-pen text-5xl sm:text-7xl text-[#2724d1]">
                  Napkin Sketches
                </span>{" "}
                into Web Components.
              </h1>

              {/* Subhead */}
              <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#52525b] max-w-2xl mx-auto">
                Powered by <strong className="text-[#18181b]">Sketch2Kernel</strong>. Doodle on our digital napkin canvas or upload a paper wireframe photo to get an instant live sandboxed component and copyable HTML code.
              </p>

              {/* Primary Sketchbook Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <SketchButton
                  variant="primary"
                  onClick={handleLaunchPlayground}
                  className="w-full sm:w-auto text-sm py-3 px-8 text-white font-bold shadow-lg gpu-layer will-change-transform"
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
                    className="w-full sm:w-auto text-sm py-3 px-6 text-[#18181b] font-semibold gpu-layer will-change-transform"
                  >
                    <Code2 className="size-4" />
                    <span>View Repository</span>
                  </SketchButton>
                </a>
              </div>

              {/* Clean Feature Badges (Zero Emojis, Pure Lucide Icons) */}
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs">
                <SketchBadge stroke="#2724d1" fill="rgba(39, 36, 209, 0.06)">
                  <span className="flex items-center gap-1.5 text-[#2724d1] font-semibold">
                    <PenTool className="size-3.5" />
                    HTML5 Freehand Canvas
                  </span>
                </SketchBadge>
                <SketchBadge stroke="#7c3aed" fill="rgba(124, 58, 237, 0.06)">
                  <span className="flex items-center gap-1.5 text-[#7c3aed] font-semibold">
                    <Smartphone className="size-3.5" />
                    Mobile &amp; Touch Friendly
                  </span>
                </SketchBadge>
                <SketchBadge stroke="#d12724" fill="rgba(209, 39, 36, 0.06)">
                  <span className="flex items-center gap-1.5 text-[#d12724] font-semibold">
                    <Zap className="size-3.5" />
                    Live Sandboxed Runner
                  </span>
                </SketchBadge>
                <SketchBadge stroke="#188a42" fill="rgba(24, 138, 66, 0.06)">
                  <span className="flex items-center gap-1.5 text-[#188a42] font-semibold">
                    <Sliders className="size-3.5" />
                    Live Two-Way Props
                  </span>
                </SketchBadge>
              </div>
            </div>

            {/* Interactive Napkin Showcase Mockup: Hackathon Theme */}
            <div className="mt-14 sm:mt-16 relative mx-auto max-w-5xl">
              <SketchCard
                roughness={1.5}
                stroke="#18181b"
                fill="#ffffff"
                className="rounded-3xl p-4 sm:p-7 shadow-2xl gpu-layer"
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
                          <span>[ Sketch2Kernel ]</span>
                          <span className="text-[10px]">[ ★ 142 ]</span>
                        </div>
                        <div className="text-[11px] text-[#18181b] leading-tight">
                          Turn hand-drawn napkin wireframes into web components in seconds!
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

                  {/* Right Napkin: Compiled Live Web Component */}
                  <div className="flex flex-col rounded-2xl border-2 border-[#188a42]/80 bg-[#faf9f5] p-5 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-[#188a42] uppercase tracking-wider">
                        2. Compiled Web Component
                      </span>
                      <span className="rounded border border-[#188a42] bg-emerald-50 px-2 py-0.5 text-[10px] font-mono text-[#188a42] font-bold">
                        Web Component Output
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
                              Sketch2Kernel
                            </h4>
                          </div>
                          <span className="rounded-lg bg-emerald-50 px-2 py-0.5 text-[11px] font-mono text-[#188a42] font-bold border border-emerald-300">
                            ★ 142
                          </span>
                        </div>
                        <p className="mt-2.5 text-xs text-[#52525b] leading-relaxed">
                          Turn hand-drawn napkin wireframes into web components in seconds!
                        </p>
                        <div className="mt-3 flex gap-1.5 font-mono">
                          <span className="rounded bg-gray-100 border border-gray-300 px-1.5 py-0.5 text-[10px] text-[#2724d1]">
                            Next.js 16
                          </span>
                          <span className="rounded bg-gray-100 border border-gray-300 px-1.5 py-0.5 text-[10px] text-purple-700">
                            Web Component
                          </span>
                          <span className="rounded bg-gray-100 border border-gray-300 px-1.5 py-0.5 text-[10px] text-pink-700">
                            Gemma 4
                          </span>
                        </div>
                        <SketchButton
                          variant="primary"
                          onClick={handleLaunchPlayground}
                          className="mt-4 w-full text-xs font-bold py-2 shadow-md gpu-layer will-change-transform"
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

        {/* SECTION: Supported AI Providers & Inference Engines */}
        <section className="relative border-t-2 border-[#18181b] bg-[#fdfdfb] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2724d1]">
                Multi-Model Infrastructure
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#18181b] sm:text-4xl">
                Choose Your Vision &amp; Inference Engine
              </h2>
              <p className="mt-3 text-sm text-[#52525b]">
                Sketch2Kernel supports native Hacktoberfest Gemma models, ultra-fast NVIDIA NIM inference, and any custom OpenAI-compatible endpoint.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Provider 1: Google Gemini */}
              <SketchCard
                roughness={1.5}
                stroke="#2724d1"
                fill="#ffffff"
                className="p-6 transition-all hover:scale-102 rounded-2xl gpu-layer will-change-transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-11 items-center justify-center rounded-xl border-2 border-[#2724d1] bg-blue-50 text-[#2724d1] shadow-xs">
                    <Sparkles className="size-5 stroke-[2.2]" />
                  </div>
                  <span className="font-mono text-[10px] font-bold rounded-full bg-blue-100 text-[#2724d1] px-2.5 py-1 border border-blue-200">
                    29 RPM Protection
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#18181b] font-mono">
                  Google Gemini Engine
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#52525b]">
                  Hacktoberfest flagship track powered by <strong className="text-[#18181b]">Gemma 4 31B</strong> with seamless fallback to Gemma 4 26B. Ideal for rich UI comprehension and layout synthesis.
                </p>
                <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 flex flex-wrap gap-1.5 font-mono text-[10px]">
                  <span className="bg-zinc-100 border border-zinc-300 rounded px-2 py-0.5 text-zinc-700">
                    gemma-4-31b-it
                  </span>
                  <span className="bg-zinc-100 border border-zinc-300 rounded px-2 py-0.5 text-zinc-700">
                    gemma-4-26b-it
                  </span>
                </div>
              </SketchCard>

              {/* Provider 2: NVIDIA NIM */}
              <SketchCard
                roughness={1.5}
                stroke="#7c3aed"
                fill="#ffffff"
                className="p-6 transition-all hover:scale-102 rounded-2xl gpu-layer will-change-transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-11 items-center justify-center rounded-xl border-2 border-[#7c3aed] bg-purple-50 text-[#7c3aed] shadow-xs">
                    <Cpu className="size-5 stroke-[2.2]" />
                  </div>
                  <span className="font-mono text-[10px] font-bold rounded-full bg-purple-100 text-[#7c3aed] px-2.5 py-1 border border-purple-200">
                    39 RPM Sliding Window
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#18181b] font-mono">
                  NVIDIA NIM Acceleration
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#52525b]">
                  Enterprise-grade high-throughput endpoints supporting <strong className="text-[#18181b]">z-ai/glm-5.3</strong> and <strong className="text-[#18181b]">meta/llama-3.1-70b-instruct</strong> with optional deep reasoning toggles.
                </p>
                <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 flex flex-wrap gap-1.5 font-mono text-[10px]">
                  <span className="bg-zinc-100 border border-zinc-300 rounded px-2 py-0.5 text-zinc-700">
                    z-ai/glm-5.3
                  </span>
                  <span className="bg-zinc-100 border border-zinc-300 rounded px-2 py-0.5 text-zinc-700">
                    llama-3.1-70b
                  </span>
                </div>
              </SketchCard>

              {/* Provider 3: Custom Endpoints */}
              <SketchCard
                roughness={1.5}
                stroke="#188a42"
                fill="#ffffff"
                className="p-6 transition-all hover:scale-102 rounded-2xl gpu-layer will-change-transform"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex size-11 items-center justify-center rounded-xl border-2 border-[#188a42] bg-emerald-50 text-[#188a42] shadow-xs">
                    <Globe className="size-5 stroke-[2.2]" />
                  </div>
                  <span className="font-mono text-[10px] font-bold rounded-full bg-emerald-100 text-[#188a42] px-2.5 py-1 border border-emerald-200">
                    OpenAI Compatible
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#18181b] font-mono">
                  Custom &amp; Local Endpoints
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#52525b]">
                  Plug in any local or cloud LLM runner (Ollama, vLLM, OpenRouter, Groq, Together). Configure your custom endpoint URL, model ID, and private API key.
                </p>
                <div className="mt-4 pt-4 border-t border-dashed border-zinc-200 flex flex-wrap gap-1.5 font-mono text-[10px]">
                  <span className="bg-zinc-100 border border-zinc-300 rounded px-2 py-0.5 text-zinc-700">
                    Ollama / vLLM
                  </span>
                  <span className="bg-zinc-100 border border-zinc-300 rounded px-2 py-0.5 text-zinc-700">
                    OpenRouter / Groq
                  </span>
                </div>
              </SketchCard>
            </div>
          </div>
        </section>

        {/* SECTION: Visual Showcase & Gallery (Drop User GIFs & Pictures) */}
        <section className="relative border-t-2 border-[#18181b] bg-[#eceae1] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-10">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#2724d1]">
                Interactive Demonstration
              </span>
              <h2 className="mt-2 text-3xl font-extrabold text-[#18181b] sm:text-4xl">
                See Sketch2Kernel in Action
              </h2>
              <p className="mt-2 text-sm text-[#52525b]">
                Explore how real-time tactile sketch recognition, multi-model compilation, and dynamic live props work together.
              </p>

              {/* Showcase Tab Switcher */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveShowcaseTab("canvas")}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded-xl border-2 transition-all cursor-pointer gpu-layer ${
                    activeShowcaseTab === "canvas"
                      ? "border-[#2724d1] bg-[#2724d1] text-white shadow-md"
                      : "border-[#18181b] bg-white text-[#18181b] hover:bg-zinc-100"
                  }`}
                >
                  Napkin Canvas &amp; Tools
                </button>
                <button
                  type="button"
                  onClick={() => setActiveShowcaseTab("models")}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded-xl border-2 transition-all cursor-pointer gpu-layer ${
                    activeShowcaseTab === "models"
                      ? "border-[#7c3aed] bg-[#7c3aed] text-white shadow-md"
                      : "border-[#18181b] bg-white text-[#18181b] hover:bg-zinc-100"
                  }`}
                >
                  Multi-Engine AI Synthesis
                </button>
                <button
                  type="button"
                  onClick={() => setActiveShowcaseTab("sandbox")}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded-xl border-2 transition-all cursor-pointer gpu-layer ${
                    activeShowcaseTab === "sandbox"
                      ? "border-[#188a42] bg-[#188a42] text-white shadow-md"
                      : "border-[#18181b] bg-white text-[#18181b] hover:bg-zinc-100"
                  }`}
                >
                  Live Sandboxed Web Components
                </button>
                <button
                  type="button"
                  onClick={() => setActiveShowcaseTab("props")}
                  className={`px-4 py-2 text-xs font-mono font-bold rounded-xl border-2 transition-all cursor-pointer gpu-layer ${
                    activeShowcaseTab === "props"
                      ? "border-[#d12724] bg-[#d12724] text-white shadow-md"
                      : "border-[#18181b] bg-white text-[#18181b] hover:bg-zinc-100"
                  }`}
                >
                  Two-Way Props Binding
                </button>
              </div>
            </div>

            {/* Showcase Media Card / User GIF Slot */}
            <div className="mx-auto max-w-5xl">
              <SketchCard
                roughness={1.4}
                stroke="#18181b"
                fill="#ffffff"
                className="rounded-3xl p-6 sm:p-8 shadow-2xl gpu-layer"
              >
                {/* Tab 1: Napkin Canvas */}
                {activeShowcaseTab === "canvas" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-zinc-200 pb-4">
                      <div>
                        <h3 className="text-lg font-bold font-mono text-[#18181b]">
                          Tactile Digital Sketchbook &amp; Drawing Suite
                        </h3>
                        <p className="text-xs text-[#52525b] mt-0.5">
                          60fps freehand pen strokes, element stamps, undo/redo history, and photo wireframe upload.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-blue-50 border border-blue-200 px-2 py-1 text-[11px] font-mono text-[#2724d1] font-semibold">
                          Shortcuts: 1-6 Tools • Ctrl+Z
                        </span>
                      </div>
                    </div>

                    {/* SHOWCASE MEDIA CONTAINER: Canvas GIF */}
                    <div className="relative rounded-2xl border-2 border-[#18181b] overflow-hidden bg-black/5 shadow-md">
                      <img
                        src="/assets/canvas.gif"
                        alt="Tactile Digital Sketchbook in action"
                        className="w-full h-auto object-cover max-h-[540px] rounded-2xl"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 2: Multi-Engine AI Synthesis */}
                {activeShowcaseTab === "models" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-zinc-200 pb-4">
                      <div>
                        <h3 className="text-lg font-bold font-mono text-[#18181b]">
                          Multi-Engine AI Synthesis &amp; Thinking Controls
                        </h3>
                        <p className="text-xs text-[#52525b] mt-0.5">
                          Independent provider tabs for Gemini, NVIDIA NIM, and Custom Endpoints with separate API keys and models.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-purple-50 border border-purple-200 px-2 py-1 text-[11px] font-mono text-[#7c3aed] font-semibold">
                          Independent Credentials
                        </span>
                      </div>
                    </div>

                    {/* SHOWCASE MEDIA CONTAINER: Compile GIF */}
                    <div className="relative rounded-2xl border-2 border-[#18181b] overflow-hidden bg-black/5 shadow-md">
                      <img
                        src="/assets/compile.gif"
                        alt="Multi-Engine AI Synthesis in action"
                        className="w-full h-auto object-cover max-h-[540px] rounded-2xl"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 3: Live Sandboxed Web Components */}
                {activeShowcaseTab === "sandbox" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-zinc-200 pb-4">
                      <div>
                        <h3 className="text-lg font-bold font-mono text-[#18181b]">
                          Isolated Live Sandbox &amp; Responsive Viewports
                        </h3>
                        <p className="text-xs text-[#52525b] mt-0.5">
                          Sandboxed iframe with live web rendering, DOMPurify XSS protection, and mobile/tablet/desktop viewports.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-mono text-[#188a42] font-semibold">
                          CSP &amp; DOMPurify Protected
                        </span>
                      </div>
                    </div>

                    {/* SHOWCASE MEDIA CONTAINER: Sandbox GIF */}
                    <div className="relative rounded-2xl border-2 border-[#18181b] overflow-hidden bg-black/5 shadow-md">
                      <img
                        src="/assets/sandbox.gif"
                        alt="Live Sandboxed Web Components & Props in action"
                        className="w-full h-auto object-cover max-h-[540px] rounded-2xl"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                {/* Tab 4: Two-Way Props Binding */}
                {activeShowcaseTab === "props" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-zinc-200 pb-4">
                      <div>
                        <h3 className="text-lg font-bold font-mono text-[#18181b]">
                          Two-Way Dynamic Props Panel &amp; Workbench
                        </h3>
                        <p className="text-xs text-[#52525b] mt-0.5">
                          Synthesized components expose interactive text, color, and numeric properties that re-render live on keyup.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-red-50 border border-red-200 px-2 py-1 text-[11px] font-mono text-[#d12724] font-semibold">
                          Real-Time Prop Sync
                        </span>
                      </div>
                    </div>

                    {/* SHOWCASE MEDIA CONTAINER: Playground Workbench Screenshot */}
                    <div className="relative rounded-2xl border-2 border-[#18181b] overflow-hidden bg-black/5 shadow-md">
                      <img
                        src="/assets/playground.png"
                        alt="Interactive Workbench in action"
                        className="w-full h-auto object-cover max-h-[540px] rounded-2xl"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}
              </SketchCard>
            </div>
          </div>
        </section>

        {/* 3 Core Architecture Cards */}
        <section className="relative border-t-2 border-[#18181b] bg-[#fdfdfb] py-16 sm:py-24">
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
                className="p-6 transition-all hover:scale-102 rounded-2xl gpu-layer will-change-transform"
              >
                <div className="flex size-11 items-center justify-center rounded-xl border-2 border-[#2724d1] bg-blue-50 text-[#2724d1] mb-5 shadow-xs">
                  <PenTool className="size-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-[#18181b] font-mono">
                  Dual-Mode Drawing Board
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#52525b]">
                  Continuous 60fps solid strokes with mouse, Apple Pencil, or mobile touch. Includes draggable element stamps and real napkin photo upload.
                </p>
              </SketchCard>

              {/* Feature Card 2 */}
              <SketchCard
                roughness={1.5}
                stroke="#7c3aed"
                fill="#ffffff"
                className="p-6 transition-all hover:scale-102 rounded-2xl gpu-layer will-change-transform"
              >
                <div className="flex size-11 items-center justify-center rounded-xl border-2 border-[#7c3aed] bg-purple-50 text-[#7c3aed] mb-5 shadow-xs">
                  <Zap className="size-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-[#18181b] font-mono">
                  Gemma 4 31B Synthesis
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#52525b]">
                  Direct multimodal inference pipeline with strict Zod schema validation. Produces pure semantic HTML web markup with detected variable slots.
                </p>
              </SketchCard>

              {/* Feature Card 3 */}
              <SketchCard
                roughness={1.5}
                stroke="#188a42"
                fill="#ffffff"
                className="p-6 transition-all hover:scale-102 rounded-2xl gpu-layer will-change-transform"
              >
                <div className="flex size-11 items-center justify-center rounded-xl border-2 border-[#188a42] bg-emerald-50 text-[#188a42] mb-5 shadow-xs">
                  <Sliders className="size-5 stroke-[2.2]" />
                </div>
                <h3 className="text-base font-bold text-[#18181b] font-mono">
                  Live Sandbox &amp; 2-Way Props
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[#52525b]">
                  Isolated iframe runner for live components. Editing prop variables immediately re-renders the live component in real time.
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
              className="p-8 sm:p-12 text-center shadow-xl rounded-3xl gpu-layer"
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
                  className="text-sm py-3 px-8 text-white font-bold gpu-layer will-change-transform"
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
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Sketch2Kernel Logo" className="size-5 object-contain" />
            <span className="font-bold text-[#18181b]">Sketch2Kernel</span>
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
              href="https://github.com/Pierce05/sketch-to-kernel/issues/44"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2724d1] transition-colors"
            >
              Issue #44
            </a>
            <a
              href="https://github.com/Pierce05/sketch-to-kernel/pull/43"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#2724d1] transition-colors"
            >
              PR #43
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
