"use client";

import React, { useState, useMemo } from "react";
import { CompileResponse } from "@/lib/types";
import { PropsTable } from "@/components/props-table";
import { CodeViewer } from "@/components/code-viewer";
import { SketchButton, SketchBadge, SketchOptionButton } from "@/components/sketch-ui";
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
        const currentVal = propValues[prop.name] ?? prop.default;
        if (currentVal === undefined) return;

        // 1. Replace explicit template tokens: {{propName}}, {propName}, $propName
        const tokenRegex = new RegExp(`{{\\s*${prop.name}\\s*}}`, "gi");
        const singleTokenRegex = new RegExp(`(?<![a-zA-Z0-9_-]){\\s*${prop.name}\\s*}(?![a-zA-Z0-9_-])`, "gi");
        const dollarTokenRegex = new RegExp(`\\$${prop.name}\\b`, "gi");

        const hadTokens = tokenRegex.test(html) || singleTokenRegex.test(html) || dollarTokenRegex.test(html);
        if (hadTokens) {
          html = html
            .replace(tokenRegex, currentVal)
            .replace(singleTokenRegex, currentVal)
            .replace(dollarTokenRegex, currentVal);
        } else if (prop.default && currentVal !== prop.default) {
          // 2. If no tokens existed in HTML, but user changed prop from default:
          // dynamically replace occurrences of prop.default with currentVal!
          try {
            const escapedDefault = prop.default.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const defaultRegex = new RegExp(escapedDefault, "g");
            html = html.replace(defaultRegex, currentVal);
          } catch {}
        }
      });
    }

    return html;
  }, [compileResult, propValues]);

  // Construct iframe srcDoc with Tailwind Play CDN
  const iframeSrcDoc = useMemo(() => {
    if (!interpolatedHtml) return "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: '#2724d1',
          }
        }
      }
    }
  </script>
  <style>
    body {
      background-color: #fcfbf9;
      color: #18181b;
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 1.5rem;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
    }
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
    <div className="relative flex size-full flex-col overflow-hidden rounded-2xl border-2 border-[#18181b] bg-white shadow-xl">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#18181b] bg-[#eceae1] px-3 sm:px-4 py-2.5 text-xs">
        {/* Left: Tabs ([Live Preview] vs [Code]) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1">
            <SketchOptionButton
              active={activeTab === "preview"}
              onClick={() => setActiveTab("preview")}
              className="px-2.5 py-1 text-xs"
            >
              <Eye className="size-3.5" />
              <span>Live Preview</span>
            </SketchOptionButton>

            <SketchOptionButton
              active={activeTab === "code"}
              onClick={() => setActiveTab("code")}
              className="px-2.5 py-1 text-xs"
            >
              <Code2 className="size-3.5" />
              <span>Code</span>
            </SketchOptionButton>
          </div>

          {/* Component Name Badge */}
          {compileResult && (
            <div className="hidden sm:flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-mono font-bold text-[#2724d1] border border-[#2724d1]">
              <Layers className="size-3 text-[#2724d1]" />
              <span>&lt;{compileResult.componentName} /&gt;</span>
            </div>
          )}

          {/* Demo Mock Mode Pill */}
          {isMock && (
            <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-bold text-amber-800 border border-amber-300">
              Demo Mock Mode
            </span>
          )}
        </div>

        {/* Right: Actions (Viewport, Reset, Copy) */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-0">
          {/* Viewport switch (only active on preview tab) */}
          {activeTab === "preview" && (
            <div className="flex items-center gap-1">
              <SketchOptionButton
                active={viewportMode === "desktop"}
                onClick={() => setViewportMode("desktop")}
                title="Desktop viewport (100%)"
                className="p-1 px-1.5"
              >
                <Monitor className="size-3.5" />
              </SketchOptionButton>
              <SketchOptionButton
                active={viewportMode === "mobile"}
                onClick={() => setViewportMode("mobile")}
                title="Mobile viewport (375px)"
                className="p-1 px-1.5"
              >
                <Smartphone className="size-3.5" />
              </SketchOptionButton>
            </div>
          )}

          {/* Reset Sandbox Button */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 rounded-xl border border-[#18181b] bg-white px-2.5 py-1 text-xs font-mono font-semibold text-[#18181b] hover:bg-[#f5f4ee] transition-colors"
            title="Reset sandbox state"
          >
            <RotateCcw className="size-3" />
            <span className="hidden md:inline">Reset</span>
          </button>

          {/* Copy Code Button */}
          <SketchButton
            variant="primary"
            onClick={handleCopyCode}
            disabled={!interpolatedHtml}
            className="text-xs font-bold py-1 px-3"
            title="Copy Tailwind HTML"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span className="hidden sm:inline">Copy Code</span>
              </>
            )}
          </SketchButton>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 overflow-hidden bg-[#faf9f5]">
        {compileResult ? (
          activeTab === "preview" ? (
            /* Live Iframe Sandbox Container */
            <div className="flex size-full items-center justify-center p-2 sm:p-4 bg-sketchbook-dots overflow-auto">
              <div
                className={`h-full transition-all duration-300 flex items-center justify-center ${
                  viewportMode === "mobile"
                    ? "w-[375px] max-w-full rounded-3xl border-4 border-[#18181b] bg-white p-1 shadow-2xl overflow-hidden"
                    : "w-full rounded-xl border-2 border-[#18181b] bg-white shadow-md"
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
          <div className="flex size-full flex-col items-center justify-center p-6 text-center bg-sketchbook-grid">
            <div className="flex size-14 items-center justify-center rounded-2xl border-2 border-[#2724d1] bg-blue-50 text-[#2724d1] mb-3 shadow-xs">
              <Sparkles className="size-6" />
            </div>
            <h4 className="text-sm font-bold font-mono text-[#18181b]">
              Live Sandbox Awaiting Compilation
            </h4>
            <p className="mt-1 text-xs text-[#52525b] max-w-xs leading-relaxed">
              Doodle a napkin wireframe on the left drawing board and click &ldquo;Compile Component&rdquo; to see instant live Tailwind rendering with editable props.
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
