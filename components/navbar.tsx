"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { ApiKeyMode } from "@/lib/types";
import { STORAGE_CUSTOM_KEY, STORAGE_KEY_MODE } from "@/lib/utils";
import { useInkBlobRouter } from "@/components/ink-blob-transition";
import { SketchButton, SketchCard, SketchBadge } from "@/components/sketch-ui";
import {
  KeyRound,
  Check,
  Eye,
  EyeOff,
  ArrowLeft,
  X,
  PenTool,
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
    // If closing without a saved custom key, revert cleanly to previous key mode
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
    <header className="sticky top-0 z-40 w-full border-b-2 border-[#18181b] bg-[#f6f5f0]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          {pathname === "/playground" && (
            <button
              onClick={(e) => handleNavClick(e, "/")}
              className="group flex size-9 items-center justify-center rounded-lg border-2 border-[#18181b] bg-white text-[#18181b] transition-all hover:-translate-x-0.5 hover:shadow-sm"
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
                Sketch<span className="text-[#2724d1]">ToKernel</span>
                <SketchBadge
                  stroke="#2724d1"
                  fill="rgba(39, 36, 209, 0.08)"
                  className="hidden sm:inline-flex text-[10px] text-[#2724d1] font-bold"
                >
                  Gemma 4 31B
                </SketchBadge>
              </span>
            </div>
          </a>
        </div>

        {/* Right Section: API Key Selector & GitHub */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Key Mode Selector */}
          <div className="flex items-center rounded-xl border-2 border-[#18181b] bg-white p-1 shadow-xs">
            <button
              type="button"
              onClick={() => handleModeSelect("default_1")}
              className={`rounded-lg px-2.5 sm:px-3 py-1 text-xs font-mono font-bold transition-all ${
                apiKeyMode === "default_1"
                  ? "bg-[#2724d1] text-white shadow-xs"
                  : "text-[#52525b] hover:text-[#18181b] hover:bg-[#f5f4ee]"
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
                  ? "bg-[#2724d1] text-white shadow-xs"
                  : "text-[#52525b] hover:text-[#18181b] hover:bg-[#f5f4ee]"
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
                  ? "bg-[#7c3aed] text-white shadow-xs"
                  : "text-[#52525b] hover:text-[#18181b] hover:bg-[#f5f4ee]"
              }`}
              title="Custom Gemini API Key"
            >
              <KeyRound className="size-3" />
              <span>Custom</span>
              {customApiKey && <span className="size-1.5 rounded-full bg-emerald-500" />}
            </button>
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

      {/* Custom Key Modal: Hand-drawn Napkin Index Card */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md">
            <SketchCard
              roughness={1.5}
              stroke="#18181b"
              fill="#ffffff"
              className="p-6 shadow-2xl rounded-2xl"
            >
              <div className="flex items-center justify-between border-b-2 border-[#18181b] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-8 items-center justify-center rounded-lg border-2 border-[#7c3aed] bg-purple-50 text-[#7c3aed]">
                    <KeyRound className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-mono text-[#18181b]">Custom Gemini API Key</h3>
                    <p className="text-xs text-[#52525b]">For Gemma 4 31B compilation calls</p>
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

              <form onSubmit={handleSaveCustomKey} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-[#18181b] mb-1.5">
                    Enter Gemini API Key
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
                    Stored locally in <code className="text-[#2724d1] font-bold">localStorage</code>. Never shared.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
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
        </div>
      )}
    </header>
  );
}
