"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { CanvasPanel } from "@/components/canvas-panel";
import { SandboxPanel } from "@/components/sandbox-panel";
import { CANVAS_PRESETS, CanvasPreset } from "@/components/canvas-presets";
import { ApiKeyMode, CompileRequest, CompileResponse } from "@/lib/types";
import { STORAGE_CUSTOM_KEY, STORAGE_KEY_MODE } from "@/lib/utils";
import confetti from "canvas-confetti";
import { PenTool, Eye, AlertCircle, Sparkles, X, ChevronRight, Layers } from "lucide-react";

export default function PlaygroundPage() {
  const [apiKeyMode, setApiKeyMode] = useState<ApiKeyMode>("default_1");
  const [customApiKey, setCustomApiKey] = useState("");

  // Compilation state
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<CompileResponse | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mobile side drawer state (for live sandbox)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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

  const handleCompile = async (
    imageDataUrl: string,
    selectedPreset?: CanvasPreset
  ) => {
    setIsCompiling(true);
    setErrorMessage(null);

    const payload: CompileRequest = {
      image: imageDataUrl,
      apiKeyType: apiKeyMode,
      ...(apiKeyMode === "custom" && customApiKey
        ? { customApiKey }
        : {}),
    };

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`API compilation returned status ${res.status}`);
      }

      const data: CompileResponse = await res.json();

      if (data.error && !data.html) {
        throw new Error(data.error);
      }

      setCompileResult(data);
      setIsMock(false);

      // On mobile screens, automatically open the side drawer when compiled!
      setIsMobileDrawerOpen(true);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      console.warn("Backend compile API error. Falling back to Hacktoberfest preset mock:", err);

      const fallbackPreset = selectedPreset || CANVAS_PRESETS[0];
      setCompileResult({
        componentName: fallbackPreset.mockResponse.componentName,
        html: fallbackPreset.mockResponse.html,
        props: fallbackPreset.mockResponse.props,
      });
      setIsMock(true);

      // Open side drawer on mobile for fallback mock
      setIsMobileDrawerOpen(true);

      const errString = err instanceof Error ? err.message : String(err);
      if (!errString.includes("404") && !errString.includes("status")) {
        setErrorMessage(`Compilation notice: ${errString}. Loaded preset fallback.`);
      }
    } finally {
      setIsCompiling(false);
    }
  };

  const handleResetSandbox = () => {
    setCompileResult(null);
    setIsMock(false);
    setErrorMessage(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f6f5f0] text-[#18181b] font-sans selection:bg-[#fef08a] selection:text-[#18181b]">
      {/* Top Navbar */}
      <Navbar
        apiKeyMode={apiKeyMode}
        onApiKeyModeChange={handleApiKeyModeChange}
        customApiKey={customApiKey}
        onCustomApiKeyChange={handleCustomApiKeyChange}
      />

      {/* Error / Notice Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between border-b-2 border-[#d12724] bg-red-50 px-4 py-2 text-xs text-[#d12724] font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-[#d12724]" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#d12724] hover:text-red-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile Top Controls Bar (visible only below md breakpoint) */}
      <div className="flex md:hidden items-center justify-between border-b-2 border-[#18181b] bg-[#eceae1] px-3 py-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 font-bold text-[#18181b]">
          <PenTool className="size-3.5 text-[#2724d1]" />
          <span>Drawing Board</span>
        </div>

        {/* Button to open the mobile side drawer */}
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border-2 border-[#18181b] bg-white px-3 py-1 font-mono text-xs font-bold text-[#18181b] shadow-xs hover:bg-[#f5f4ee] active:scale-95 transition-all"
        >
          <Eye className="size-3.5 text-[#2724d1]" />
          <span>Live Sandbox</span>
          {compileResult && (
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
          <ChevronRight className="size-3 text-[#52525b]" />
        </button>
      </div>

      {/* Main Edge-to-Edge Workbench Body */}
      <main className="flex-1 w-full p-1.5 sm:p-2.5 lg:p-3 overflow-hidden bg-sketchbook-grid">
        <div className="flex h-[calc(100vh-4.5rem)] w-full flex-col md:flex-row gap-2 sm:gap-3">
          {/* Left Panel: Drawing Canvas (Full width on mobile; 50% split on desktop/tablet) */}
          <div className="h-full flex-1 md:w-1/2 min-w-0 flex">
            <CanvasPanel
              onCompile={handleCompile}
              isCompiling={isCompiling}
            />
          </div>

          {/* Right Panel: Live Sandbox Runner (Hidden on mobile; 50% split on desktop/tablet) */}
          <div className="hidden md:flex h-full flex-1 md:w-1/2 min-w-0">
            <SandboxPanel
              compileResult={compileResult}
              isMock={isMock}
              onReset={handleResetSandbox}
            />
          </div>
        </div>
      </main>

      {/* Mobile Side Drawer for Sandbox (Opens upon compilation or button press) */}
      {isMobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          {/* Backdrop with blur - clicking outside closes the drawer */}
          <div
            onClick={() => setIsMobileDrawerOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          />

          {/* Slide-out drawer content */}
          <div className="relative z-10 h-full w-[94vw] max-w-md bg-white border-l-2 border-[#18181b] flex flex-col shadow-2xl animate-in slide-in-from-right duration-250">
            {/* Drawer top close bar */}
            <div className="flex items-center justify-between border-b-2 border-[#18181b] bg-[#eceae1] px-4 py-2.5">
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-[#18181b]">
                <Layers className="size-4 text-[#2724d1]" />
                <span>Live Sandbox Drawer</span>
                {compileResult && (
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] text-[#2724d1] border border-[#2724d1]">
                    &lt;{compileResult.componentName} /&gt;
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex size-7 items-center justify-center rounded-lg border border-[#18181b] bg-white text-[#52525b] hover:text-[#18181b] active:scale-95"
                title="Close drawer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Sandbox panel inside mobile drawer */}
            <div className="flex-1 overflow-hidden">
              <SandboxPanel
                compileResult={compileResult}
                isMock={isMock}
                onReset={handleResetSandbox}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
