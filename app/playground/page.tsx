"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { CanvasPanel } from "@/components/canvas-panel";
import { SandboxPanel } from "@/components/sandbox-panel";
import { CANVAS_PRESETS, CanvasPreset } from "@/components/canvas-presets";
import { ApiKeyMode, CompileRequest, CompileResponse } from "@/lib/types";
import { STORAGE_CUSTOM_KEY, STORAGE_KEY_MODE } from "@/lib/utils";
import confetti from "canvas-confetti";
import { PenTool, Eye, AlertCircle, Sparkles } from "lucide-react";

export default function PlaygroundPage() {
  const [apiKeyMode, setApiKeyMode] = useState<ApiKeyMode>("default_1");
  const [customApiKey, setCustomApiKey] = useState("");

  // Compilation state
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileResult, setCompileResult] = useState<CompileResponse | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Mobile view tab: "canvas" or "preview"
  const [mobileTab, setMobileTab] = useState<"canvas" | "preview">("canvas");

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

      // On mobile, automatically switch tab to preview on success
      setMobileTab("preview");

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err: unknown) {
      console.warn("Backend compile API error. Falling back to Hacktoberfest preset mock:", err);

      // Graceful fallback mock
      const fallbackPreset = selectedPreset || CANVAS_PRESETS[0];
      setCompileResult({
        componentName: fallbackPreset.mockResponse.componentName,
        html: fallbackPreset.mockResponse.html,
        props: fallbackPreset.mockResponse.props,
      });
      setIsMock(true);
      setMobileTab("preview");

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

      {/* Mobile Tab Toggle Bar (visible only below md breakpoint) */}
      <div className="flex md:hidden items-center justify-around border-b-2 border-[#18181b] bg-[#eceae1] p-1.5 text-xs font-mono">
        <button
          onClick={() => setMobileTab("canvas")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 font-bold transition-all ${
            mobileTab === "canvas"
              ? "bg-[#2724d1] text-white shadow-xs"
              : "text-[#52525b] hover:text-[#18181b]"
          }`}
        >
          <PenTool className="size-3.5" />
          <span>Canvas &amp; Tools</span>
        </button>

        <button
          onClick={() => setMobileTab("preview")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 font-bold transition-all ${
            mobileTab === "preview"
              ? "bg-[#2724d1] text-white shadow-xs"
              : "text-[#52525b] hover:text-[#18181b]"
          }`}
        >
          <Eye className="size-3.5" />
          <span>Live Preview &amp; Code</span>
          {compileResult && (
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </button>
      </div>

      {/* Main Split-Screen Workbench Body */}
      <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden bg-sketchbook-grid">
        <div className="mx-auto flex h-[calc(100vh-5.5rem)] max-w-7xl flex-col md:flex-row gap-4">
          {/* Left Panel: Drawing Canvas */}
          <div
            className={`h-full flex-1 md:w-1/2 min-w-0 ${
              mobileTab === "canvas" ? "flex" : "hidden md:flex"
            }`}
          >
            <CanvasPanel
              onCompile={handleCompile}
              isCompiling={isCompiling}
            />
          </div>

          {/* Right Panel: Live Sandbox Runner */}
          <div
            className={`h-full flex-1 md:w-1/2 min-w-0 ${
              mobileTab === "preview" ? "flex" : "hidden md:flex"
            }`}
          >
            <SandboxPanel
              compileResult={compileResult}
              isMock={isMock}
              onReset={handleResetSandbox}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
