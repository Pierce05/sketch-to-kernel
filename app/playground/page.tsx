"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { CanvasPanel } from "@/components/canvas-panel";
import { SandboxPanel } from "@/components/sandbox-panel";
import { CANVAS_PRESETS, CanvasPreset } from "@/components/canvas-presets";
import { ApiKeyMode, CustomProvider, CompileRequest, CompileResponse } from "@/lib/types";
import { compileWithCustomEndpoint } from "@/lib/custom-endpoint";
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
import confetti from "canvas-confetti";
import { PenTool, Eye, AlertCircle, Sparkles, X, ChevronRight, Layers, ShieldAlert } from "lucide-react";

export default function PlaygroundPage() {
  const [apiKeyMode, setApiKeyMode] = useState<ApiKeyMode>("default_1");
  const [customApiKey, setCustomApiKey] = useState("");
  const [customProvider, setCustomProvider] = useState<CustomProvider>("gemini");
  const [customKeyGemini, setCustomKeyGemini] = useState("");
  const [customKeyNvidia, setCustomKeyNvidia] = useState("");
  const [customKeyEndpoint, setCustomKeyEndpoint] = useState("");
  const [customModelNvidia, setCustomModelNvidia] = useState("z-ai/glm-5.3-flash");
  const [customModelEndpoint, setCustomModelEndpoint] = useState("gpt-4o");
  const [customModelId, setCustomModelId] = useState("z-ai/glm-5.3-flash");
  const [customEndpoint, setCustomEndpoint] = useState("https://api.openai.com/v1/chat/completions");
  const [customThinking, setCustomThinking] = useState(false);
  const [customExtraBodyNvidia, setCustomExtraBodyNvidia] = useState(false);
  const [nimExtraBody, setNimExtraBody] = useState(false);

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
      const savedProvider = localStorage.getItem(STORAGE_CUSTOM_PROVIDER) as CustomProvider;
      if (savedProvider) setCustomProvider(savedProvider);

      const savedKeyGemini = localStorage.getItem(STORAGE_CUSTOM_KEY_GEMINI);
      if (savedKeyGemini) {
        setCustomKeyGemini(savedKeyGemini);
      } else if (savedProvider === "gemini" && savedKey) {
        setCustomKeyGemini(savedKey);
      }

      const savedKeyNvidia = localStorage.getItem(STORAGE_CUSTOM_KEY_NVIDIA);
      if (savedKeyNvidia) {
        setCustomKeyNvidia(savedKeyNvidia);
      } else if (savedProvider === "nvidia" && savedKey) {
        setCustomKeyNvidia(savedKey);
      }

      const savedKeyEndpoint = localStorage.getItem(STORAGE_CUSTOM_KEY_ENDPOINT);
      if (savedKeyEndpoint) {
        setCustomKeyEndpoint(savedKeyEndpoint);
      } else if (savedProvider === "custom" && savedKey) {
        setCustomKeyEndpoint(savedKey);
      }

      const savedModelNvidia = localStorage.getItem(STORAGE_CUSTOM_MODEL_NVIDIA);
      if (savedModelNvidia) setCustomModelNvidia(savedModelNvidia);

      const savedModelEndpoint = localStorage.getItem(STORAGE_CUSTOM_MODEL_ENDPOINT);
      if (savedModelEndpoint) setCustomModelEndpoint(savedModelEndpoint);

      const savedModel = localStorage.getItem(STORAGE_CUSTOM_MODEL);
      if (savedModel) setCustomModelId(savedModel);
      const savedEndpoint = localStorage.getItem(STORAGE_CUSTOM_ENDPOINT);
      if (savedEndpoint) setCustomEndpoint(savedEndpoint);
      const savedThinking = localStorage.getItem(STORAGE_CUSTOM_THINKING);
      if (savedThinking !== null) setCustomThinking(savedThinking === "true");

      const savedExtraBody = localStorage.getItem(STORAGE_CUSTOM_EXTRA_BODY_NVIDIA);
      if (savedExtraBody !== null) setCustomExtraBodyNvidia(savedExtraBody === "true");

      const savedNimExtraBody = localStorage.getItem(STORAGE_NIM_EXTRA_BODY);
      if (savedNimExtraBody !== null) setNimExtraBody(savedNimExtraBody === "true");
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

  const handleCustomExtraBodyNvidiaChange = (enabled: boolean) => {
    setCustomExtraBodyNvidia(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_CUSTOM_EXTRA_BODY_NVIDIA, String(enabled));
    }
  };

  const handleNimExtraBodyChange = (enabled: boolean) => {
    setNimExtraBody(enabled);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_NIM_EXTRA_BODY, String(enabled));
    }
  };

  const handleCompile = async (
    imageDataUrl: string,
    selectedPreset?: CanvasPreset,
    wireframeDescription?: string
  ) => {
    setIsCompiling(true);
    setErrorMessage(null);

    const effectiveKey =
      apiKeyMode === "custom"
        ? (customProvider === "gemini"
            ? customKeyGemini || customApiKey
            : customProvider === "nvidia"
            ? customKeyNvidia || customApiKey
            : customKeyEndpoint || customApiKey)
        : undefined;

    const effectiveModel =
      apiKeyMode === "custom"
        ? (customProvider === "nvidia"
            ? customModelNvidia || "z-ai/glm-5.3-flash"
            : customProvider === "custom"
            ? customModelEndpoint || "gpt-4o"
            : undefined)
        : undefined;

    const isCustomEndpoint = apiKeyMode === "custom" && customProvider === "custom";
    const isLocalCustom = isCustomEndpoint && isLocalhostEndpoint(customEndpoint);

    // On hosted Vercel, cloud serverless functions cannot reach localhost / 127.0.0.1
    // on the user's laptop. When a loopback/LAN endpoint is detected, execute direct
    // client-side compilation from the user's browser where the local runner lives!
    if (isLocalCustom) {
      try {
        const clientResult = await compileWithCustomEndpoint({
          endpoint: customEndpoint || "http://127.0.0.1:8000",
          apiKey: effectiveKey || "",
          modelId: effectiveModel || "default",
          imageDataUrl,
          wireframeDescription,
        });

        if (!clientResult.success || !clientResult.data) {
          throw new Error(clientResult.error || "Custom endpoint compilation failed");
        }

        setCompileResult(clientResult.data);
        setIsMock(false);
        setIsMobileDrawerOpen(true);
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
        });
        return;
      } catch (err: unknown) {
        const errString = err instanceof Error ? err.message : String(err);
        console.error("Local custom endpoint compilation failed:", errString);
        let userMsg = errString;
        if (
          errString.includes("Failed to fetch") ||
          errString.includes("NetworkError") ||
          errString.includes("fetch failed")
        ) {
          userMsg =
            `Local Endpoint Connection Failed (${customEndpoint}): ` +
            `1) Make sure your local server (Ollama, vLLM, LM Studio) is running. ` +
            `2) Enable CORS (for Ollama: set OLLAMA_ORIGINS="*"). ` +
            `3) If your browser blocks HTTPS to HTTP mixed content, expose your port with an HTTPS tunnel like "cloudflared tunnel --url http://127.0.0.1:8000" or "ngrok http 8000" and use the https:// URL.`;
        }
        setErrorMessage(userMsg);
        return;
      } finally {
        setIsCompiling(false);
      }
    }

    const isNvidia =
      apiKeyMode === "default_2" ||
      (apiKeyMode === "custom" && customProvider === "nvidia");

    const effectiveExtraBody =
      apiKeyMode === "default_2" ? nimExtraBody : customExtraBodyNvidia;

    const payload: CompileRequest = {
      image: imageDataUrl,
      apiKeyType: apiKeyMode,
      wireframeDescription,
      enableThinking: customThinking,
      enableExtraBody: isNvidia ? effectiveExtraBody : false,
      ...(apiKeyMode === "custom"
        ? {
            customProvider,
            customApiKey: effectiveKey || undefined,
            customModelId: effectiveModel || undefined,
            customEndpoint: customEndpoint || undefined,
          }
        : {}),
    };

    try {
      const res = await fetch("/api/compile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `API compilation returned status ${res.status}`);
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
      const errString = err instanceof Error ? err.message : String(err);

      // For NVIDIA NIM or Custom Endpoint: strictly NO fallback to mock, only clear error handling!
      const isCustomOrNvidia =
        apiKeyMode === "default_2" ||
        (apiKeyMode === "custom" && (customProvider === "nvidia" || customProvider === "custom"));
      if (isCustomOrNvidia) {
        console.error("Compilation failed:", errString);
        setErrorMessage(errString);
        return;
      }

      // For Gemini: fallback to preset mock with informative notice
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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#f6f5f0] text-[#18181b] font-sans selection:bg-[#fef08a] selection:text-[#18181b]">
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
        customExtraBodyNvidia={customExtraBodyNvidia}
        onCustomExtraBodyNvidiaChange={handleCustomExtraBodyNvidiaChange}
        nimExtraBody={nimExtraBody}
        onNimExtraBodyChange={handleNimExtraBodyChange}
      />

      {/* Error / Rate Limit Notice Banner */}
      {errorMessage && (
        <div
          className={`flex shrink-0 items-center justify-between border-b-2 px-4 py-2 text-xs font-mono transition-all ${
            errorMessage.includes("rate limit") || errorMessage.includes("39 RPM")
              ? "border-amber-500 bg-amber-50 text-amber-900"
              : "border-[#d12724] bg-red-50 text-[#d12724]"
          }`}
        >
          <div className="flex items-center gap-2">
            {errorMessage.includes("rate limit") || errorMessage.includes("39 RPM") ? (
              <ShieldAlert className="size-4 shrink-0 text-amber-600" />
            ) : (
              <AlertCircle className="size-4 shrink-0 text-[#d12724]" />
            )}
            <span className="font-semibold">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="hover:opacity-80 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Mobile Top Controls Bar (visible only below md breakpoint) */}
      <div className="flex shrink-0 md:hidden items-center justify-between border-b-2 border-[#18181b] bg-[#eceae1] px-3 py-2 text-xs font-mono">
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

      {/* Main Edge-to-Edge Workbench Body (strictly non-scrolling) */}
      <main className="flex-1 min-h-0 w-full p-1.5 sm:p-2 lg:p-2.5 overflow-hidden bg-sketchbook-grid">
        <div className="flex size-full flex-col md:flex-row gap-2 sm:gap-2.5 min-h-0 overflow-hidden">
          {/* Left Panel: Drawing Canvas (Full width on mobile; 50% split on desktop/tablet) */}
          <div className="h-full flex-1 md:w-1/2 min-w-0 min-h-0 flex overflow-hidden">
            <CanvasPanel
              onCompile={handleCompile}
              isCompiling={isCompiling}
              compileProvider={customProvider}
              compileModelId={
                apiKeyMode === "default_2"
                  ? "z-ai/glm-5.3"
                  : customProvider === "nvidia"
                  ? customModelNvidia
                  : customModelEndpoint
              }
              apiKeyMode={apiKeyMode}
            />
          </div>

          {/* Right Panel: Live Sandbox Runner (Hidden on mobile; 50% split on desktop/tablet) */}
          <div className="hidden md:flex h-full flex-1 md:w-1/2 min-w-0 min-h-0 overflow-hidden">
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
