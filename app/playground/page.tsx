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
      const response = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: CompileResponse = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      setCompileResult(data);
      setIsMock(false);
      setMobileTab("preview"); // Automatically show preview on mobile

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Graceful Mock Fallback: Use selected preset or default SaaS Pricing Card
      const fallbackPreset = selectedPreset ?? CANVAS_PRESETS[0];

      setCompileResult({
        componentName: fallbackPreset.mockResponse.componentName,
        html: fallbackPreset.mockResponse.html,
        props: fallbackPreset.mockResponse.props,
      });
      setIsMock(true);
      setMobileTab("preview"); // Switch to preview on mobile

      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.6 },
      });
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
    <div className="flex min-h-screen flex-col bg-[#090a0f] text-gray-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Navbar */}
      <Navbar
        apiKeyMode={apiKeyMode}
        onApiKeyModeChange={handleApiKeyModeChange}
        customApiKey={customApiKey}
        onCustomApiKeyChange={handleCustomApiKeyChange}
      />

      {/* Error / Notice Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between border-b border-red-900/40 bg-red-950/40 px-4 py-2 text-xs text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-red-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-400 hover:text-red-200"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile Tab Toggle Bar (visible only below md breakpoint) */}
      <div className="flex md:hidden items-center justify-around border-b border-[#232738] bg-[#11131b] p-1.5 text-xs">
        <button
          onClick={() => setMobileTab("canvas")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 font-medium transition-colors ${
            mobileTab === "canvas"
              ? "bg-indigo-600 text-white shadow"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <PenTool className="size-3.5" />
          <span>Canvas &amp; Tools</span>
        </button>

        <button
          onClick={() => setMobileTab("preview")}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 font-medium transition-colors ${
            mobileTab === "preview"
              ? "bg-indigo-600 text-white shadow"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Eye className="size-3.5" />
          <span>Live Preview &amp; Code</span>
          {compileResult && (
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          )}
        </button>
      </div>

      {/* Main Split-Screen Workbench Body */}
      <main className="flex-1 p-2 sm:p-4 lg:p-6 overflow-hidden">
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
