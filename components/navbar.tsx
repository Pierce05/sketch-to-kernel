"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ApiKeyMode } from "@/lib/types";
import { STORAGE_CUSTOM_KEY, STORAGE_KEY_MODE } from "@/lib/utils";
import { useInkBlobRouter } from "@/components/ink-blob-transition";
import {
  Sparkles,
  KeyRound,
  Check,
  Eye,
  EyeOff,
  Layers,
  ArrowLeft,
  X,
} from "lucide-react";

interface NavbarProps {
  apiKeyMode: ApiKeyMode;
  onApiKeyModeChange: (mode: ApiKeyMode) => void;
  customApiKey: string;
  onCustomApiKeyChange: (key: string) => void;
}

export function Navbar({
  apiKeyMode,
  onApiKeyModeChange,
  customApiKey,
  onCustomApiKeyChange,
}: NavbarProps) {
  const pathname = usePathname();
  const { navigateWithBlob } = useInkBlobRouter();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState(customApiKey);
  const [previousMode, setPreviousMode] = useState<ApiKeyMode>(apiKeyMode);
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setTempKey(customApiKey);
  }, [customApiKey]);

  const handleModeSelect = (mode: ApiKeyMode) => {
    if (mode === "custom") {
      setPreviousMode(apiKeyMode);
      onApiKeyModeChange("custom");
      setShowKeyModal(true);
    } else {
      onApiKeyModeChange(mode);
    }
  };

  const handleCloseModal = () => {
    setShowKeyModal(false);
    // If closing without a saved custom key, revert to previous key mode
    if (!customApiKey) {
      onApiKeyModeChange(previousMode === "custom" ? "default_1" : previousMode);
    }
  };

  const handleSaveCustomKey = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = tempKey.trim();
    if (trimmed) {
      onCustomApiKeyChange(trimmed);
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
    <header className="sticky top-0 z-40 w-full border-b-2 border-[#2b3044] bg-[#0c0e15]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          {pathname === "/playground" && (
            <button
              onClick={(e) => handleNavClick(e, "/")}
              className="group flex size-9 items-center justify-center rounded-xl border-2 border-[#2b3044] bg-[#131520] text-gray-300 transition-colors hover:border-indigo-500 hover:text-white"
              title="Return to Sketchbook Home"
              aria-label="Back to home"
            >
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            </button>
          )}

          <a
            href="/"
            onClick={(e) => handleNavClick(e, "/")}
            className="flex items-center gap-2.5 font-semibold text-white transition-opacity hover:opacity-90"
          >
            <div className="flex size-9 items-center justify-center rounded-xl border-2 border-indigo-400 bg-indigo-950/80 shadow-md shadow-indigo-500/20">
              <Layers className="size-5 text-indigo-300" />
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-base font-bold font-mono tracking-tight">
                Sketch<span className="text-indigo-400">ToKernel</span>
                <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-300 border border-indigo-500/40">
                  Gemma 4
                </span>
              </span>
            </div>
          </a>
        </div>

        {/* Right Section: API Key Selector & GitHub */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Key Mode Selector */}
          <div className="flex items-center rounded-xl border-2 border-[#2b3044] bg-[#131520] p-1 shadow-inner">
            <button
              type="button"
              onClick={() => handleModeSelect("default_1")}
              className={`rounded-lg px-2.5 sm:px-3 py-1 text-xs font-mono font-bold transition-all ${
                apiKeyMode === "default_1"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              title="Default Team Key 1 (Gemma 4 31B)"
            >
              Key 1
            </button>

            <button
              type="button"
              onClick={() => handleModeSelect("default_2")}
              className={`rounded-lg px-2.5 sm:px-3 py-1 text-xs font-mono font-bold transition-all ${
                apiKeyMode === "default_2"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              title="Default Team Key 2 (Fallback)"
            >
              Key 2
            </button>

            <button
              type="button"
              onClick={() => handleModeSelect("custom")}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-xs font-mono font-bold transition-all ${
                apiKeyMode === "custom"
                  ? "bg-purple-600 text-white shadow"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              title="Custom Gemini API Key"
            >
              <KeyRound className="size-3" />
              <span>Custom</span>
              {customApiKey && <span className="size-1.5 rounded-full bg-emerald-400" />}
            </button>
          </div>

          {/* GitHub Repo Link Badge */}
          <a
            href="https://github.com/Pierce05/sketch-to-kernel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#2b3044] bg-[#131520] px-3 py-1.5 text-xs font-mono font-bold text-gray-300 transition-colors hover:border-indigo-500 hover:text-white"
            aria-label="View on GitHub"
          >
            <svg className="size-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span className="hidden md:inline">GitHub</span>
          </a>
        </div>
      </div>

      {/* Custom Key Modal: Reverts cleanly on cancel */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border-2 border-[#2b3044] bg-[#0c0e15] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#232738] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-purple-950/80 text-purple-400 border border-purple-800/40">
                  <KeyRound className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-mono text-white">Custom Gemini API Key</h3>
                  <p className="text-xs text-gray-400">Used for Gemma 4 31B compilation requests</p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="flex size-7 items-center justify-center rounded-lg border border-[#2b3044] text-gray-400 hover:text-white"
                title="Cancel and restore previous key"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomKey} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-mono font-medium text-gray-300 mb-1.5">
                  Enter Gemini API Key
                </label>
                <div className="relative">
                  <input
                    type={showKeySecret ? "text" : "password"}
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    placeholder="AIzaSy..."
                    autoFocus
                    className="w-full rounded-xl border-2 border-[#2b3044] bg-[#131520] px-3.5 py-2.5 pr-10 text-xs font-mono text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeySecret(!showKeySecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showKeySecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11px] text-gray-400 font-mono">
                  Stored in browser <code className="text-indigo-300">localStorage</code>. Never sent to any 3rd party.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl border border-[#2b3044] bg-[#131520] px-3.5 py-2 text-xs font-mono text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-mono font-bold text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-600/30"
                >
                  {isSaved ? (
                    <>
                      <Check className="size-3.5 text-emerald-300" /> Saved
                    </>
                  ) : (
                    "Save & Use Key"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
