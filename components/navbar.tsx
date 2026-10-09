"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ApiKeyMode, CustomProvider } from "@/lib/types";
import {
  STORAGE_CUSTOM_KEY,
  STORAGE_KEY_MODE,
  STORAGE_CUSTOM_PROVIDER,
  STORAGE_CUSTOM_MODEL,
} from "@/lib/utils";
import { useInkBlobRouter } from "@/components/ink-blob-transition";
import {
  SketchButton,
  SketchCard,
  SketchBadge,
  SketchOptionButton,
} from "@/components/sketch-ui";
import {
  KeyRound,
  Check,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  PenTool,
  Cpu,
  Sparkles,
  ShieldAlert,
} from "lucide-react";

interface NavbarProps {
  apiKeyMode: ApiKeyMode;
  onApiKeyModeChange: (mode: ApiKeyMode) => void;
  customApiKey: string;
  onCustomApiKeyChange: (key: string) => void;
  customProvider?: CustomProvider;
  onCustomProviderChange?: (provider: CustomProvider) => void;
  customModelId?: string;
  onCustomModelIdChange?: (model: string) => void;
}

export function Navbar({
  apiKeyMode,
  onApiKeyModeChange,
  customApiKey,
  onCustomApiKeyChange,
  customProvider = "gemini",
  onCustomProviderChange,
  customModelId = "z-ai/glm-5-3",
  onCustomModelIdChange,
}: NavbarProps) {
  const pathname = usePathname();
  const { navigateWithBlob } = useInkBlobRouter();
  const [mounted, setMounted] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);

  // Modal draft state
  const [activeTab, setActiveTab] = useState<CustomProvider>(customProvider);
  const [tempKey, setTempKey] = useState(customApiKey);
  const [tempModel, setTempModel] = useState(customModelId || "z-ai/glm-5-3");
  const [previousMode, setPreviousMode] = useState<ApiKeyMode>(apiKeyMode);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setTempKey(customApiKey);
    setActiveTab(customProvider);
    setTempModel(customModelId || "z-ai/glm-5-3");
  }, [customApiKey, customProvider, customModelId]);

  const handleModeSelect = (mode: ApiKeyMode) => {
    if (mode === "custom") {
      setPreviousMode(apiKeyMode);
      setActiveTab(customProvider);
      setTempKey(customApiKey);
      setTempModel(customModelId || "z-ai/glm-5-3");
      setShowKeyModal(true);
    } else {
      onApiKeyModeChange(mode);
    }
  };

  const handleCloseModal = () => {
    setShowKeyModal(false);
    // If closing without saved custom key, revert cleanly to previous mode
    if (!customApiKey) {
      onApiKeyModeChange(previousMode === "custom" ? "default_1" : previousMode);
    }
  };

  const handleSaveCustomKey = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedKey = tempKey.trim();
    const trimmedModel = tempModel.trim() || "z-ai/glm-5-3";

    if (trimmedKey) {
      onCustomApiKeyChange(trimmedKey);
      onCustomProviderChange?.(activeTab);
      onCustomModelIdChange?.(trimmedModel);
      onApiKeyModeChange("custom");

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_CUSTOM_KEY, trimmedKey);
        localStorage.setItem(STORAGE_CUSTOM_PROVIDER, activeTab);
        localStorage.setItem(STORAGE_CUSTOM_MODEL, trimmedModel);
        localStorage.setItem(STORAGE_KEY_MODE, "custom");
      }

      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setShowKeyModal(false);
      }, 500);
    } else {
      handleCloseModal();
    }
  };

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (pathname === href) return;
    navigateWithBlob(href, { x: e.clientX, y: e.clientY });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-[#18181b] bg-[#f6f5f0]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          {pathname === "/playground" && (
            <button
              onClick={(e) => handleNavClick(e, "/")}
              className="group flex size-9 items-center justify-center rounded-lg border-2 border-[#18181b] bg-white text-[#18181b] transition-all hover:-translate-x-0.5 hover:shadow-xs active:scale-95"
              title="Return to Sketchbook Home"
              aria-label="Back to home"
            >
              <ArrowLeft className="size-4" />
            </button>
          )}

          <a
            href="/"
            onClick={(e) => handleNavClick(e, "/")}
            className="flex items-center gap-2.5 text-[#18181b] transition-opacity hover:opacity-90"
          >
            <div className="flex size-9 items-center justify-center rounded-lg border-2 border-[#2724d1] bg-blue-50 text-[#2724d1] shadow-xs">
              <PenTool className="size-4.5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-base sm:text-lg font-bold font-mono tracking-tight text-[#18181b]">
                Sketch<span className="text-[#2724d1]">2UI</span>
                <SketchBadge
                  stroke="#2724d1"
                  fill="rgba(39, 36, 209, 0.08)"
                  className="hidden sm:inline-flex text-[10px] text-[#2724d1] font-bold"
                >
                  Gemma 4 &amp; NIM
                </SketchBadge>
              </span>
            </div>
          </a>
        </div>

        {/* Right Section: API Key Selector & GitHub */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Key Mode Selector */}
          <div className="flex items-center gap-1">
            {/* Key 1: Gemini API */}
            <SketchOptionButton
              type="button"
              active={apiKeyMode === "default_1"}
              onClick={() => handleModeSelect("default_1")}
              title="Key 1: Gemini API (Gemma models via Google GenAI)"
              className="px-2.5 sm:px-3 py-1"
            >
              <span>Key 1</span>
              <span className="text-[10px] opacity-75 hidden md:inline">(Gemini)</span>
            </SketchOptionButton>

            {/* Key 2: NVIDIA NIM (z-ai/glm-5-3) */}
            <SketchOptionButton
              type="button"
              active={apiKeyMode === "default_2"}
              activeFill="#059669"
              activeStroke="#059669"
              onClick={() => handleModeSelect("default_2")}
              title="Key 2: NVIDIA NIM (Model: z-ai/glm-5-3 • 39 RPM rate limited)"
              className="px-2.5 sm:px-3 py-1"
            >
              <span>Key 2</span>
              <span className="text-[10px] opacity-75 hidden md:inline">(NIM)</span>
            </SketchOptionButton>

            {/* Custom: Tabbed Gemini or NVIDIA NIM */}
            <SketchOptionButton
              type="button"
              active={apiKeyMode === "custom"}
              activeFill="#7c3aed"
              activeStroke="#7c3aed"
              onClick={() => handleModeSelect("custom")}
              title={`Custom API Key (${customProvider === "nvidia" ? "NVIDIA NIM" : "Gemini"})`}
              className="px-2.5 sm:px-3 py-1"
            >
              <KeyRound className="size-3" />
              <span>Custom</span>
              {customApiKey && <span className="size-1.5 rounded-full bg-emerald-500" />}
            </SketchOptionButton>
          </div>

          {/* GitHub Repo Link Badge */}
          <a
            href="https://github.com/Pierce05/sketch-to-kernel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#18181b] bg-white px-3 py-1.5 text-xs font-mono font-bold text-[#18181b] transition-all hover:bg-[#f5f4ee] hover:shadow-xs"
            aria-label="View on GitHub"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>
      </div>

      {/* Custom Key Modal: Rendered via Portal to body */}
      {showKeyModal && mounted && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 sm:p-6 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
          <div className="my-auto w-full max-w-md max-h-[88vh] overflow-y-auto">
            <SketchCard
              roughness={1.5}
              stroke="#18181b"
              fill="#ffffff"
              className="p-5 sm:p-6 shadow-2xl rounded-2xl"
            >
              {/* Modal Top Bar */}
              <div className="flex items-center justify-between border-b-2 border-[#18181b] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg border-2 border-[#7c3aed] bg-purple-50 text-[#7c3aed]">
                    <KeyRound className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-[#18181b]">Custom AI Configuration</h3>
                    <p className="text-xs text-[#52525b]">Select provider and enter your API credentials</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="flex size-7 items-center justify-center rounded-lg border border-[#18181b] text-[#52525b] hover:text-[#18181b] hover:bg-[#f5f4ee]"
                  title="Cancel and restore previous key"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* 2-Tabbed Provider Options (Gemini API vs NVIDIA NIM) */}
              <div className="mt-4 flex items-center gap-2 border-b-2 border-[#18181b]/20 pb-3">
                <SketchOptionButton
                  type="button"
                  active={activeTab === "gemini"}
                  activeFill="#2724d1"
                  activeStroke="#2724d1"
                  onClick={() => setActiveTab("gemini")}
                  className="flex-1 py-1.5 text-xs font-bold"
                >
                  <Sparkles className="size-3.5" />
                  <span>Gemini API</span>
                </SketchOptionButton>

                <SketchOptionButton
                  type="button"
                  active={activeTab === "nvidia"}
                  activeFill="#059669"
                  activeStroke="#059669"
                  onClick={() => setActiveTab("nvidia")}
                  className="flex-1 py-1.5 text-xs font-bold"
                >
                  <Cpu className="size-3.5" />
                  <span>NVIDIA NIM</span>
                </SketchOptionButton>
              </div>

              {/* Form Influenced By Tab Selection */}
              <form onSubmit={handleSaveCustomKey} className="mt-4 space-y-4">
                {activeTab === "gemini" ? (
                  /* TAB 1: GEMINI API (Only asks for Gemini API Key) */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#18181b] mb-1.5">
                        Gemini API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showKeySecret ? "text" : "password"}
                          value={tempKey}
                          onChange={(e) => setTempKey(e.target.value)}
                          placeholder="AIzaSy..."
                          autoFocus
                          className="w-full rounded-xl border-2 border-[#18181b] bg-[#fcfbf9] px-3.5 py-2.5 pr-10 text-xs font-mono text-[#18181b] placeholder-[#a1a1aa] focus:border-[#2724d1] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeySecret(!showKeySecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#18181b]"
                        >
                          {showKeySecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <p className="mt-1.5 text-[11px] text-[#71717a] font-mono">
                        Direct connection to Google GenAI with dynamic Gemma 4 26B ↔ 31B fallback.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* TAB 2: NVIDIA NIM (Asks for Model ID and API Key both) */
                  <div className="space-y-3">
                    {/* Model ID Input */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#18181b] mb-1.5">
                        NVIDIA NIM Model ID
                      </label>
                      <input
                        type="text"
                        value={tempModel}
                        onChange={(e) => setTempModel(e.target.value)}
                        placeholder="z-ai/glm-5-3"
                        className="w-full rounded-xl border-2 border-[#18181b] bg-[#fcfbf9] px-3.5 py-2 text-xs font-mono text-[#18181b] placeholder-[#a1a1aa] focus:border-[#059669] focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-[#71717a] font-mono">
                        Target model (e.g. <code className="text-[#059669] font-bold">z-ai/glm-5-3</code> or meta/llama-3.1-70b-instruct).
                      </p>
                    </div>

                    {/* NVIDIA API Key Input */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#18181b] mb-1.5">
                        NVIDIA NIM API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showKeySecret ? "text" : "password"}
                          value={tempKey}
                          onChange={(e) => setTempKey(e.target.value)}
                          placeholder="nvapi-..."
                          className="w-full rounded-xl border-2 border-[#18181b] bg-[#fcfbf9] px-3.5 py-2.5 pr-10 text-xs font-mono text-[#18181b] placeholder-[#a1a1aa] focus:border-[#059669] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeySecret(!showKeySecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#18181b]"
                        >
                          {showKeySecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Strict 39 RPM Metric notice */}
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-2.5 text-xs text-emerald-900 flex items-start gap-2">
                      <ShieldAlert className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-tight">
                        <strong>Strict 39 RPM Limiter Active:</strong> All calls across this key are timed within a sliding 60-second window to prevent registering 429 quota errors.
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#18181b]/10">
                  <SketchButton
                    type="button"
                    variant="secondary"
                    onClick={handleCloseModal}
                    className="text-xs py-1.5 px-3.5"
                  >
                    Cancel
                  </SketchButton>
                  <SketchButton
                    type="submit"
                    variant="primary"
                    className="text-xs py-1.5 px-4"
                  >
                    {isSaved ? (
                      <>
                        <Check className="size-3.5 text-emerald-300" /> Saved
                      </>
                    ) : (
                      "Save Key"
                    )}
                  </SketchButton>
                </div>
              </form>
            </SketchCard>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
