"use client";

import React, { useState, useMemo } from "react";
import { CompileResponse } from "@/lib/types";
import { PropsTable } from "@/components/props-table";
import { CodeViewer } from "@/components/code-viewer";
import confetti from "canvas-confetti";
import {
  Eye,
  Code2,
  Smartphone,
  Monitor,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Layers,
  Terminal,
} from "lucide-react";

interface SandboxPanelProps {
  compileResult: CompileResponse | null;
  isMock: boolean;
  onReset: () => void;
}

export function SandboxPanel({
  compileResult,
  isMock,
  onReset,
}: SandboxPanelProps) {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">("desktop");
  const [copied, setCopied] = useState(false);

  // Live editable prop values
  const [propValues, setPropValues] = useState<Record<string, string>>({});

  // Initialize or update prop values when compileResult changes
  React.useEffect(() => {
    if (compileResult?.props) {
      const initial: Record<string, string> = {};
      compileResult.props.forEach((p) => {
        initial[p.name] = p.default;
      });
      setPropValues(initial);
    } else {
      setPropValues({});
    }
  }, [compileResult]);

  const handlePropChange = (name: string, value: string) => {
    setPropValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetProps = () => {
    if (compileResult?.props) {
      const initial: Record<string, string> = {};
      compileResult.props.forEach((p) => {
        initial[p.name] = p.default;
      });
      setPropValues(initial);
    }
  };

  // Dynamically interpolate template props into HTML for live sandbox render
  const interpolatedHtml = useMemo(() => {
    if (!compileResult?.html) return "";
    let html = compileResult.html;

    if (compileResult.props && compileResult.props.length > 0) {
      compileResult.props.forEach((prop) => {
        const val = propValues[prop.name] ?? prop.default;
        // Replace moustache tokens {{propName}} or $propName
        const tokenRegex = new RegExp(`{{\\s*${prop.name}\\s*}}`, "g");
        html = html.replace(tokenRegex, val);
      });
    }

    return html;
  }, [compileResult, propValues]);

  // Construct iframe srcDoc with Tailwind Play CDN
  const iframeSrcDoc = useMemo(() => {
    if (!interpolatedHtml) return "";

    return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#6366f1',
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #0b0d14;
      color: #f3f4f6;
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 1.5rem;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
    /* Smooth transitions */
    * {
      transition: all 0.15s ease-in-out;
    }
  </style>
</head>
<body>
  ${interpolatedHtml}
</body>
</html>`;
  }, [interpolatedHtml]);

  const handleCopyCode = async () => {
    if (!interpolatedHtml) return;
    try {
      await navigator.clipboard.writeText(interpolatedHtml);
      setCopied(true);
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative flex size-full flex-col overflow-hidden rounded-2xl border border-[#232738] bg-[#0c0e15] shadow-2xl">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#232738] bg-[#11131b] px-3 sm:px-4 py-2 text-xs">
        {/* Left: Tabs ([Live Preview] vs [Code]) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center rounded-lg border border-[#2b3044] bg-[#090a0f] p-0.5">
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === "preview"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Eye className="size-3.5" />
              <span>Live Preview</span>
            </button>

            <button
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                activeTab === "code"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <Code2 className="size-3.5" />
              <span>Code</span>
            </button>
          </div>

          {/* Component Name Badge */}
          {compileResult && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-md bg-purple-950/60 px-2 py-0.5 text-[11px] font-mono text-purple-300 border border-purple-800/40">
              <Layers className="size-3 text-purple-400" />
              <span>&lt;{compileResult.componentName} /&gt;</span>
            </div>
          )}

          {/* Demo Mock Mode Pill */}
          {isMock && (
            <span className="flex items-center gap-1 rounded-md bg-amber-950/50 px-2 py-0.5 text-[10px] font-mono text-amber-300 border border-amber-800/40">
              Demo Mock Mode
            </span>
          )}
        </div>

        {/* Right: Actions (Viewport, Reset, Copy) */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-0">
          {/* Viewport switch (only active on preview tab) */}
          {activeTab === "preview" && (
            <div className="flex items-center rounded-lg border border-[#2b3044] bg-[#090a0f] p-0.5 text-gray-400">
              <button
                onClick={() => setViewportMode("desktop")}
                className={`rounded p-1 transition-colors ${
                  viewportMode === "desktop"
                    ? "bg-gray-800 text-white"
                    : "hover:text-gray-200"
                }`}
                title="Desktop viewport (100%)"
              >
                <Monitor className="size-3.5" />
              </button>
              <button
                onClick={() => setViewportMode("mobile")}
                className={`rounded p-1 transition-colors ${
                  viewportMode === "mobile"
                    ? "bg-gray-800 text-white"
                    : "hover:text-gray-200"
                }`}
                title="Mobile viewport (375px)"
              >
                <Smartphone className="size-3.5" />
              </button>
            </div>
          )}

          {/* Reset Sandbox Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 rounded-lg border border-[#2b3044] bg-[#090a0f] px-2 py-1 text-xs text-gray-400 hover:border-gray-600 hover:text-white transition-colors"
            title="Reset sandbox state"
          >
            <RotateCcw className="size-3" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Copy Code Button */}
          <button
            onClick={handleCopyCode}
            disabled={!interpolatedHtml}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/80 transition-all shadow-sm disabled:opacity-40"
            title="Copy Tailwind HTML"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span className="hidden sm:inline">Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 overflow-hidden bg-[#07080d]">
        {compileResult ? (
          activeTab === "preview" ? (
            /* Live Iframe Sandbox Container */
            <div className="flex size-full items-center justify-center p-2 sm:p-4 bg-dot-matrix overflow-auto">
              <div
                className={`h-full transition-all duration-300 flex items-center justify-center ${
                  viewportMode === "mobile"
                    ? "w-[375px] max-w-full rounded-3xl border-4 border-gray-800 bg-[#0b0d14] p-1 shadow-2xl overflow-hidden"
                    : "w-full rounded-xl border border-[#232738] bg-[#0b0d14]"
                }`}
                style={{ minHeight: "350px" }}
              >
                <iframe
                  sandbox="allow-scripts"
                  srcDoc={iframeSrcDoc}
                  title="Compiled Tailwind Component Preview"
                  className="size-full rounded-lg border-0 block"
                />
              </div>
            </div>
          ) : (
            /* Syntax Code Viewer */
            <CodeViewer
              code={interpolatedHtml}
              componentName={compileResult.componentName}
            />
          )
        ) : (
          /* Empty Sandbox State */
          <div className="flex size-full flex-col items-center justify-center p-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-950/30 text-indigo-400 mb-3 shadow-inner">
              <Sparkles className="size-6" />
            </div>
            <h4 className="text-sm font-semibold text-gray-300">
              Live Sandbox Awaiting Compilation
            </h4>
            <p className="mt-1 text-xs text-gray-500 max-w-xs">
              Draw a napkin sketch on the left whiteboard and click &ldquo;Compile Component&rdquo; to see instant live Tailwind rendering with editable props.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Props & Variables Inspector */}
      {compileResult && (
        <PropsTable
          props={compileResult.props}
          values={propValues}
          onPropChange={handlePropChange}
          onResetProps={handleResetProps}
        />
      )}
    </div>
  );
}
