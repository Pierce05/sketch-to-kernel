"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import logoImg from "@/assets/logo.png";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
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
  STORAGE_NIM_EXTRA_BODY,
  STORAGE_CUSTOM_EXTRA_BODY_NVIDIA,
  isLocalhostEndpoint,
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
  Globe,
  BrainCircuit,
  Sliders,
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
  customEndpoint?: string;
  onCustomEndpointChange?: (endpoint: string) => void;
  customThinking?: boolean;
  onCustomThinkingChange?: (thinking: boolean) => void;
  customKeyGemini?: string;
  onCustomKeyGeminiChange?: (key: string) => void;
  customKeyNvidia?: string;
  onCustomKeyNvidiaChange?: (key: string) => void;
  customKeyEndpoint?: string;
  onCustomKeyEndpointChange?: (key: string) => void;
  customModelNvidia?: string;
  onCustomModelNvidiaChange?: (model: string) => void;
  customModelEndpoint?: string;
  onCustomModelEndpointChange?: (model: string) => void;
  customExtraBodyNvidia?: boolean;
  onCustomExtraBodyNvidiaChange?: (enabled: boolean) => void;
  nimExtraBody?: boolean;
  onNimExtraBodyChange?: (enabled: boolean) => void;
}

export function Navbar({
  apiKeyMode,
  onApiKeyModeChange,
  customApiKey,
  onCustomApiKeyChange,
  customProvider = "gemini",
  onCustomProviderChange,
  customModelId = "z-ai/glm-5.3-flash",
  onCustomModelIdChange,
  customEndpoint = "https://api.openai.com/v1/chat/completions",
  onCustomEndpointChange,
  customThinking = false,
  onCustomThinkingChange,
  customKeyGemini = "",
  onCustomKeyGeminiChange,
  customKeyNvidia = "",
  onCustomKeyNvidiaChange,
  customKeyEndpoint = "",
  onCustomKeyEndpointChange,
  customModelNvidia = "z-ai/glm-5.3-flash",
  onCustomModelNvidiaChange,
  customModelEndpoint = "gpt-4o",
  onCustomModelEndpointChange,
  customExtraBodyNvidia = false,
  onCustomExtraBodyNvidiaChange,
  nimExtraBody = false,
  onNimExtraBodyChange,
}: NavbarProps) {
  const pathname = usePathname();
  const { navigateWithBlob } = useInkBlobRouter();
  const [mounted, setMounted] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [showNimKey2Modal, setShowNimKey2Modal] = useState(false);
  const [isNimKey2Saved, setIsNimKey2Saved] = useState(false);

  // Modal draft state - separate per tab
  const [activeTab, setActiveTab] = useState<CustomProvider>(customProvider);
  const [geminiKey, setGeminiKey] = useState(customKeyGemini || (customProvider === "gemini" ? customApiKey : ""));
  const [nvidiaKey, setNvidiaKey] = useState(customKeyNvidia || (customProvider === "nvidia" ? customApiKey : ""));
  const [endpointKey, setEndpointKey] = useState(customKeyEndpoint || (customProvider === "custom" ? customApiKey : ""));
  const [nvidiaModel, setNvidiaModel] = useState(customModelNvidia || "z-ai/glm-5.3-flash");
  const [endpointModel, setEndpointModel] = useState(customModelEndpoint || "gpt-4o");
  const [tempEndpoint, setTempEndpoint] = useState(customEndpoint || "https://api.openai.com/v1/chat/completions");
  const [tempThinking, setTempThinking] = useState(customThinking);
  const [tempExtraBodyNvidia, setTempExtraBodyNvidia] = useState(customExtraBodyNvidia);
  const [tempNimExtraBody, setTempNimExtraBody] = useState(nimExtraBody);
  const [previousMode, setPreviousMode] = useState<ApiKeyMode>(apiKeyMode);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setActiveTab(customProvider);
    setGeminiKey(customKeyGemini || (customProvider === "gemini" ? customApiKey : ""));
    setNvidiaKey(customKeyNvidia || (customProvider === "nvidia" ? customApiKey : ""));
    setEndpointKey(customKeyEndpoint || (customProvider === "custom" ? customApiKey : ""));
    setNvidiaModel(customModelNvidia || "z-ai/glm-5.3-flash");
    setEndpointModel(customModelEndpoint || "gpt-4o");
    setTempEndpoint(customEndpoint || "https://api.openai.com/v1/chat/completions");
    setTempThinking(customThinking);
    setTempExtraBodyNvidia(customExtraBodyNvidia);
    setTempNimExtraBody(nimExtraBody);
  }, [
    customApiKey,
    customProvider,
    customKeyGemini,
    customKeyNvidia,
    customKeyEndpoint,
    customModelNvidia,
    customModelEndpoint,
    customEndpoint,
    customThinking,
    customExtraBodyNvidia,
    nimExtraBody,
  ]);

  const handleModeSelect = (mode: ApiKeyMode) => {
    if (mode === "custom") {
      setPreviousMode(apiKeyMode);
      setActiveTab(customProvider);
      setGeminiKey(customKeyGemini || (customProvider === "gemini" ? customApiKey : ""));
      setNvidiaKey(customKeyNvidia || (customProvider === "nvidia" ? customApiKey : ""));
      setEndpointKey(customKeyEndpoint || (customProvider === "custom" ? customApiKey : ""));
      setNvidiaModel(customModelNvidia || "z-ai/glm-5.3-flash");
      setEndpointModel(customModelEndpoint || "gpt-4o");
      setTempEndpoint(customEndpoint || "https://api.openai.com/v1/chat/completions");
      setTempThinking(customThinking);
      setTempExtraBodyNvidia(customExtraBodyNvidia);
      setShowKeyModal(true);
    } else {
      onApiKeyModeChange(mode);
    }
  };

  const handleCloseModal = () => {
    setShowKeyModal(false);
    // If closing without saved custom key, revert cleanly to previous mode
    const activeKey =
      activeTab === "gemini"
        ? geminiKey
        : activeTab === "nvidia"
        ? nvidiaKey
        : endpointKey;
    if (!activeKey && !customApiKey) {
      onApiKeyModeChange(previousMode === "custom" ? "default_1" : previousMode);
    }
  };

  const handleSaveCustomKey = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedGeminiKey = geminiKey.trim();
    const trimmedNvidiaKey = nvidiaKey.trim();
    const trimmedEndpointKey = endpointKey.trim();
    const trimmedNvidiaModel = nvidiaModel.trim() || "z-ai/glm-5.3-flash";
    const trimmedEndpointModel = endpointModel.trim() || "gpt-4o";
    const trimmedEndpoint = tempEndpoint.trim() || "https://api.openai.com/v1/chat/completions";

    let activeKey = "";
    let activeModel = "";

    if (activeTab === "gemini") {
      activeKey = trimmedGeminiKey;
      activeModel = "";
    } else if (activeTab === "nvidia") {
      activeKey = trimmedNvidiaKey;
      activeModel = trimmedNvidiaModel;
    } else {
      activeKey = trimmedEndpointKey;
      activeModel = trimmedEndpointModel;
    }

    if (activeTab === "custom" ? trimmedEndpoint : activeKey) {
      onCustomKeyGeminiChange?.(trimmedGeminiKey);
      onCustomKeyNvidiaChange?.(trimmedNvidiaKey);
      onCustomKeyEndpointChange?.(trimmedEndpointKey);
      onCustomModelNvidiaChange?.(trimmedNvidiaModel);
      onCustomModelEndpointChange?.(trimmedEndpointModel);

      onCustomApiKeyChange(activeKey);
      onCustomProviderChange?.(activeTab);
      onCustomModelIdChange?.(activeModel);
      onCustomEndpointChange?.(trimmedEndpoint);
      onCustomThinkingChange?.(tempThinking);
      onCustomExtraBodyNvidiaChange?.(tempExtraBodyNvidia);
      onApiKeyModeChange("custom");

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_CUSTOM_KEY_GEMINI, trimmedGeminiKey);
        localStorage.setItem(STORAGE_CUSTOM_KEY_NVIDIA, trimmedNvidiaKey);
        localStorage.setItem(STORAGE_CUSTOM_KEY_ENDPOINT, trimmedEndpointKey);
        localStorage.setItem(STORAGE_CUSTOM_MODEL_NVIDIA, trimmedNvidiaModel);
        localStorage.setItem(STORAGE_CUSTOM_MODEL_ENDPOINT, trimmedEndpointModel);

        localStorage.setItem(STORAGE_CUSTOM_KEY, activeKey);
        localStorage.setItem(STORAGE_CUSTOM_PROVIDER, activeTab);
        localStorage.setItem(STORAGE_CUSTOM_MODEL, activeModel);
        localStorage.setItem(STORAGE_CUSTOM_ENDPOINT, trimmedEndpoint);
        localStorage.setItem(STORAGE_CUSTOM_THINKING, String(tempThinking));
        localStorage.setItem(STORAGE_CUSTOM_EXTRA_BODY_NVIDIA, String(tempExtraBodyNvidia));
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

  const handleSaveNimKey2Settings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    onNimExtraBodyChange?.(tempNimExtraBody);
    onCustomThinkingChange?.(tempThinking);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_NIM_EXTRA_BODY, String(tempNimExtraBody));
      localStorage.setItem(STORAGE_CUSTOM_THINKING, String(tempThinking));
    }
    setIsNimKey2Saved(true);
    setTimeout(() => {
      setIsNimKey2Saved(false);
      setShowNimKey2Modal(false);
    }, 500);
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
            className="flex items-center transition-transform hover:scale-102 active:scale-98"
            title="Sketch2Kernel Home"
            aria-label="Sketch2Kernel Home"
          >
            <Image
              src={logoImg}
              alt="Sketch2Kernel"
              priority
              className="h-10 sm:h-11 w-auto max-w-[200px] sm:max-w-[240px] object-contain"
            />
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

            {/* Key 2: NVIDIA NIM (z-ai/glm-5.3) */}
            <div className="relative inline-flex items-center">
              <SketchOptionButton
                type="button"
                active={apiKeyMode === "default_2"}
                activeFill="#059669"
                activeStroke="#059669"
                onClick={() => handleModeSelect("default_2")}
                title="NVIDIA NIM (Model: z-ai/glm-5.3 • 39 RPM rate limited)"
                className="px-2.5 sm:px-3 py-1 pr-6"
              >
                <span>Key 2</span>
                <span className="text-[10px] opacity-75 hidden md:inline">(NIM)</span>
              </SketchOptionButton>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNimKey2Modal(true);
                }}
                className={`absolute right-1 size-4.5 flex items-center justify-center rounded transition-all hover:bg-black/10 active:scale-90 ${
                  apiKeyMode === "default_2" ? "text-white" : "text-[#18181b]"
                }`}
                title="Key 2 NVIDIA NIM Settings (extra_body & thinking kwargs)"
                aria-label="Key 2 NIM settings"
              >
                <Sliders className="size-3" />
              </button>
            </div>

            {/* Custom: Tabbed Gemini or NVIDIA NIM */}
            <SketchOptionButton
              type="button"
              active={apiKeyMode === "custom"}
              activeFill="#7c3aed"
              activeStroke="#7c3aed"
              onClick={() => handleModeSelect("custom")}
              title={`Custom API Key (${customProvider === "nvidia" ? "NVIDIA NIM" : customProvider === "custom" ? "Custom Endpoint" : "Gemini"})`}
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

              {/* 3-Tabbed Provider Options (Gemini API vs NVIDIA NIM vs Custom Endpoint) */}
              <div className="mt-4 flex items-center gap-1.5 border-b-2 border-[#18181b]/20 pb-3">
                <SketchOptionButton
                  type="button"
                  active={activeTab === "gemini"}
                  activeFill="#2724d1"
                  activeStroke="#2724d1"
                  onClick={() => setActiveTab("gemini")}
                  className="flex-1 py-1.5 text-xs font-bold"
                >
                  <Sparkles className="size-3.5" />
                  <span>Gemini</span>
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
                  <span>NVIDIA</span>
                </SketchOptionButton>

                <SketchOptionButton
                  type="button"
                  active={activeTab === "custom"}
                  activeFill="#7c3aed"
                  activeStroke="#7c3aed"
                  onClick={() => setActiveTab("custom")}
                  className="flex-1 py-1.5 text-xs font-bold"
                >
                  <Globe className="size-3.5" />
                  <span>Endpoint</span>
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
                          value={geminiKey}
                          onChange={(e) => setGeminiKey(e.target.value)}
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
                ) : activeTab === "nvidia" ? (
                  /* TAB 2: NVIDIA NIM (Asks for Model ID and API Key both) */
                  <div className="space-y-3">
                    {/* Model ID Input */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#18181b] mb-1.5">
                        NVIDIA NIM Model ID
                      </label>
                      <input
                        type="text"
                        value={nvidiaModel}
                        onChange={(e) => setNvidiaModel(e.target.value)}
                        placeholder="z-ai/glm-5.3-flash"
                        className="w-full rounded-xl border-2 border-[#18181b] bg-[#fcfbf9] px-3.5 py-2 text-xs font-mono text-[#18181b] placeholder-[#a1a1aa] focus:border-[#059669] focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-[#71717a] font-mono">
                        Target model (e.g. <code className="text-[#059669] font-bold">z-ai/glm-5.3-flash</code>, <code className="text-[#059669] font-bold">meta/llama-3.3-70b-instruct</code>, or deepseek-ai/deepseek-r1).
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
                          value={nvidiaKey}
                          onChange={(e) => setNvidiaKey(e.target.value)}
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

                    {/* Extra Body Checkbox for NVIDIA NIM */}
                    <div className="rounded-xl border-2 border-[#18181b] bg-[#fcfbf9] p-3 space-y-2.5">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tempExtraBodyNvidia}
                          onChange={(e) => setTempExtraBodyNvidia(e.target.checked)}
                          className="mt-0.5 size-4 rounded border-2 border-[#18181b] text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                        />
                        <div className="flex-1">
                          <div className="text-xs font-mono font-bold text-[#18181b]">
                            Enable extra_body parameter
                          </div>
                          <div className="text-[10px] text-[#71717a] font-mono leading-tight">
                            Includes extra_body kwargs in API payload. Keep disabled if your NIM model (e.g. meta/muse-glimmer-30b) rejects extra_body with HTTP 400 validation error.
                          </div>
                        </div>
                      </label>

                      {tempExtraBodyNvidia && (
                        <div className="flex items-center justify-between pt-2 border-t border-[#18181b]/10 pl-6">
                          <div>
                            <div className="text-xs font-mono font-bold text-[#18181b]">Model Thinking</div>
                            <div className="text-[10px] text-[#71717a] font-mono">
                              chat_template_kwargs.enable_thinking: {tempThinking ? "true" : "false"}
                            </div>
                          </div>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={tempThinking}
                            onClick={() => setTempThinking(!tempThinking)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-[#18181b] transition-colors duration-200 ease-in-out focus:outline-none ${
                              tempThinking ? "bg-emerald-500" : "bg-zinc-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block size-3.5 transform rounded-full border border-[#18181b] bg-white shadow-xs transition duration-200 ease-in-out ${
                                tempThinking ? "translate-x-4" : "translate-x-0.5"
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Strict 39 RPM Metric notice */}
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-2.5 text-xs text-emerald-900 flex items-start gap-2">
                      <ShieldAlert className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-[11px] leading-tight">
                        <strong>Strict 39 RPM Limiter Active:</strong> All calls across this key are timed within a sliding 60-second window to prevent registering 429 quota errors.
                      </div>
                    </div>
                  </div>
                ) : (
                  /* TAB 3: CUSTOM ENDPOINT (Endpoint, Model ID, and API Key) */
                  <div className="space-y-3">
                    {/* Endpoint URL Input */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#18181b] mb-1.5">
                        Endpoint URL
                      </label>
                      <input
                        type="url"
                        value={tempEndpoint}
                        onChange={(e) => setTempEndpoint(e.target.value)}
                        placeholder="https://api.openai.com/v1/chat/completions"
                        className="w-full rounded-xl border-2 border-[#18181b] bg-[#fcfbf9] px-3.5 py-2 text-xs font-mono text-[#18181b] placeholder-[#a1a1aa] focus:border-[#7c3aed] focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-[#71717a] font-mono">
                        OpenAI-compatible URL (e.g. Ollama, vLLM, OpenRouter, Groq, OpenAI).
                      </p>
                    </div>

                    {/* Localhost Detection Notice */}
                    {isLocalhostEndpoint(tempEndpoint) && (
                      <div className="rounded-xl border border-blue-300 bg-blue-50/80 p-2.5 text-xs text-blue-950 flex items-start gap-2">
                        <Globe className="size-4 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-[11px] leading-tight">
                          <strong>Localhost Endpoint Detected:</strong> On hosted Vercel, requests connect directly from your browser to your local runner (Ollama, vLLM, LM Studio). Ensure your local server allows CORS (e.g. <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">OLLAMA_ORIGINS=&quot;*&quot;</code>) or use an HTTPS tunnel (<code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">cloudflared</code> or <code className="bg-white/80 px-1 py-0.5 rounded font-mono font-bold">ngrok</code>).
                        </div>
                      </div>
                    )}

                    {/* Model ID Input */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#18181b] mb-1.5">
                        Model ID
                      </label>
                      <input
                        type="text"
                        value={endpointModel}
                        onChange={(e) => setEndpointModel(e.target.value)}
                        placeholder="gpt-4o"
                        className="w-full rounded-xl border-2 border-[#18181b] bg-[#fcfbf9] px-3.5 py-2 text-xs font-mono text-[#18181b] placeholder-[#a1a1aa] focus:border-[#7c3aed] focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-[#71717a] font-mono">
                        Model identifier (e.g. <code className="text-[#7c3aed] font-bold">gpt-4o</code>, llama3, qwen-2.5).
                      </p>
                    </div>

                    {/* API Key Input */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-[#18181b] mb-1.5">
                        API Key
                      </label>
                      <div className="relative">
                        <input
                          type={showKeySecret ? "text" : "password"}
                          value={endpointKey}
                          onChange={(e) => setEndpointKey(e.target.value)}
                          placeholder="sk-... (or leave empty for local models)"
                          className="w-full rounded-xl border-2 border-[#18181b] bg-[#fcfbf9] px-3.5 py-2.5 pr-10 text-xs font-mono text-[#18181b] placeholder-[#a1a1aa] focus:border-[#7c3aed] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowKeySecret(!showKeySecret)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#18181b]"
                        >
                          {showKeySecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                      <p className="mt-1 text-[11px] text-[#71717a] font-mono">
                        Bearer authentication token sent with the request header.
                      </p>
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

      {/* Key 2 NIM Settings Modal: Rendered via Portal to body */}
      {showNimKey2Modal && mounted && typeof document !== "undefined" && createPortal(
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
                  <div className="flex size-8 items-center justify-center rounded-lg border-2 border-[#059669] bg-emerald-50 text-[#059669]">
                    <Cpu className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-[#18181b]">Key 2: NVIDIA NIM Settings</h3>
                    <p className="text-xs text-[#52525b]">Model: z-ai/glm-5.3 • Microservice Options</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNimKey2Modal(false)}
                  className="flex size-7 items-center justify-center rounded-lg border border-[#18181b] text-[#52525b] hover:text-[#18181b] hover:bg-[#f5f4ee]"
                  title="Close settings"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveNimKey2Settings} className="mt-4 space-y-4">
                <div className="space-y-3">
                  {/* Strict 39 RPM notice */}
                  <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-2.5 text-xs text-emerald-900 flex items-start gap-2">
                    <ShieldAlert className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-[11px] leading-tight">
                      <strong>Strict 39 RPM Rate Limiter:</strong> Key 2 requests run through a sliding 60-second window to prevent 429 quota exhaustion.
                    </div>
                  </div>

                  {/* Extra Body Checkbox */}
                  <div className="rounded-xl border-2 border-[#18181b] bg-[#fcfbf9] p-3 space-y-2.5">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempNimExtraBody}
                        onChange={(e) => setTempNimExtraBody(e.target.checked)}
                        className="mt-0.5 size-4 rounded border-2 border-[#18181b] text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                      />
                      <div className="flex-1">
                        <div className="text-xs font-mono font-bold text-[#18181b]">
                          Enable extra_body parameter
                        </div>
                        <div className="text-[10px] text-[#71717a] font-mono leading-tight">
                          Includes extra_body kwargs in API payload. Keep disabled if your NIM model rejects extra_body with HTTP 400 validation error.
                        </div>
                      </div>
                    </label>

                    {tempNimExtraBody && (
                      <div className="flex items-center justify-between pt-2 border-t border-[#18181b]/10 pl-6">
                        <div>
                          <div className="text-xs font-mono font-bold text-[#18181b]">Model Thinking</div>
                          <div className="text-[10px] text-[#71717a] font-mono">
                            chat_template_kwargs.enable_thinking: {tempThinking ? "true" : "false"}
                          </div>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={tempThinking}
                          onClick={() => setTempThinking(!tempThinking)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-[#18181b] transition-colors duration-200 ease-in-out focus:outline-none ${
                            tempThinking ? "bg-emerald-500" : "bg-zinc-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block size-3.5 transform rounded-full border border-[#18181b] bg-white shadow-xs transition duration-200 ease-in-out ${
                              tempThinking ? "translate-x-4" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#18181b]/10">
                  <SketchButton
                    type="button"
                    variant="secondary"
                    onClick={() => setShowNimKey2Modal(false)}
                    className="text-xs py-1.5 px-3.5"
                  >
                    Cancel
                  </SketchButton>
                  <SketchButton
                    type="submit"
                    variant="primary"
                    className="text-xs py-1.5 px-4"
                  >
                    {isNimKey2Saved ? (
                      <>
                        <Check className="size-3.5 text-emerald-300" /> Saved
                      </>
                    ) : (
                      "Save Settings"
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
