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

  // Construct iframe srcDoc with live web styling and runner
  const iframeSrcDoc = useMemo(() => {
    if (!interpolatedHtml) return "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>
    // Polyfill window.localStorage and sessionStorage for sandboxed iframes (sandbox="allow-scripts")
    // Prevents fatal SecurityError DOMExceptions when scripts or Tailwind Play CDN attempt storage access.
    (function() {
      function createMemoryStorage() {
        var store = {};
        return {
          getItem: function(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null; },
          setItem: function(key, val) { store[key] = String(val); },
          removeItem: function(key) { delete store[key]; },
          clear: function() { store = {}; },
          key: function(idx) { return Object.keys(store)[idx] || null; },
          get length() { return Object.keys(store).length; }
        };
      }
      try {
        if (!window.localStorage) {
          window.localStorage = createMemoryStorage();
        }
      } catch (e) {
        try {
          Object.defineProperty(window, 'localStorage', { value: createMemoryStorage(), configurable: true, writable: true });
        } catch (e2) {}
      }
      try {
        if (!window.sessionStorage) {
          window.sessionStorage = createMemoryStorage();
        }
      } catch (e) {
        try {
          Object.defineProperty(window, 'sessionStorage', { value: createMemoryStorage(), configurable: true, writable: true });
        } catch (e2) {}
      }
    })();
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    if (typeof tailwind !== 'undefined') {
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              brand: '#2724d1',
            }
          }
        }
      };
    }
  </script>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #fcfbf9;
      color: #18181b;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 1.5rem;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
    }

    /* Semantic Elements & Form Defaults */
    input, textarea, select {
      font-family: inherit;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: #18181b;
      background-color: #ffffff;
      border: 1px solid #d4d4d8;
      border-radius: 0.5rem;
      padding: 0.625rem 0.875rem;
      outline: none;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
      width: 100%;
      box-sizing: border-box;
    }
    input[type="checkbox"], input[type="radio"] {
      width: auto;
      margin-right: 0.5rem;
      cursor: pointer;
    }
    input:focus, textarea:focus, select:focus {
      border-color: #2724d1;
      box-shadow: 0 0 0 3px rgba(39, 36, 209, 0.15);
    }
    input::placeholder, textarea::placeholder {
      color: #a1a1aa;
    }

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #3f3f46;
      margin-bottom: 0.375rem;
    }

    button, input[type="submit"], input[type="button"], .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 1.25rem;
      padding: 0.625rem 1.25rem;
      border-radius: 0.5rem;
      border: 1px solid transparent;
      background-color: #2724d1;
      color: #ffffff;
      cursor: pointer;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      transition: all 0.15s ease-in-out;
      text-decoration: none;
    }
    button:hover, input[type="submit"]:hover, input[type="button"]:hover, .btn:hover {
      background-color: #1f1cb5;
      box-shadow: 0 4px 6px -1px rgba(39, 36, 209, 0.2);
      transform: translateY(-1px);
    }
    button:active, input[type="submit"]:active, input[type="button"]:active, .btn:active {
      background-color: #1a179e;
      transform: translateY(0);
    }
    button:disabled, input[type="submit"]:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
    }
    /* Auto-card container fallback for unstyled root containers */
    body > form, body > .card, body > div:not([class*="p-"]):not([class*="bg-"]) {
      background: #ffffff;
      border: 1px solid #e4e4e7;
      border-radius: 0.75rem;
      padding: 1.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      max-width: 28rem;
      width: 100%;
    }

    h1, h2, h3, h4, h5, h6 {
      color: #09090b;
      font-weight: 700;
      line-height: 1.25;
      margin-bottom: 0.5rem;
    }
    h1 { font-size: 1.875rem; }
    h2 { font-size: 1.5rem; }
    h3 { font-size: 1.25rem; }
    h4 { font-size: 1.125rem; }
    p {
      font-size: 0.875rem;
      line-height: 1.5;
      color: #52525b;
      margin-bottom: 0.75rem;
    }
    p:last-child {
      margin-bottom: 0;
    }
    a {
      color: #2724d1;
      text-decoration: none;
      font-weight: 500;
    }
    a:hover {
      text-decoration: underline;
    }

    /* Core modern utility classes fallback */
    .flex { display: flex; }
    .inline-flex { display: inline-flex; }
    .grid { display: grid; }
    .hidden { display: none; }
    .block { display: block; }
    .inline-block { display: inline-block; }
    .flex-col { flex-direction: column; }
    .flex-row { flex-direction: row; }
    .flex-wrap { flex-wrap: wrap; }
    .items-center { align-items: center; }
    .items-start { align-items: flex-start; }
    .items-end { align-items: flex-end; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .justify-start { justify-content: flex-start; }
    .justify-end { justify-content: flex-end; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .p-1 { padding: 0.25rem; }
    .p-2 { padding: 0.5rem; }
    .p-3 { padding: 0.75rem; }
    .p-4 { padding: 1rem; }
    .p-6 { padding: 1.5rem; }
    .p-8 { padding: 2rem; }
    .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .m-auto { margin: auto; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-6 { margin-top: 1.5rem; }
    .w-full { width: 100%; }
    .w-auto { width: auto; }
    .max-w-sm { max-width: 24rem; }
    .max-w-md { max-width: 28rem; }
    .max-w-lg { max-width: 32rem; }
    .max-w-xl { max-width: 36rem; }
    .rounded { border-radius: 0.25rem; }
    .rounded-md { border-radius: 0.375rem; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-full { border-radius: 9999px; }
    .border { border: 1px solid #e4e4e7; }
    .border-slate-200, .border-gray-200, .border-zinc-200 { border-color: #e4e4e7; }
    .bg-white { background-color: #ffffff; }
    .bg-slate-50, .bg-gray-50, .bg-zinc-50 { background-color: #fafafa; }
    .bg-slate-100, .bg-gray-100, .bg-zinc-100 { background-color: #f4f4f5; }
    .bg-brand, .bg-blue-600 { background-color: #2724d1; }
    .text-white { color: #ffffff; }
    .text-slate-900, .text-gray-900, .text-zinc-900 { color: #09090b; }
    .text-slate-700, .text-gray-700, .text-zinc-700 { color: #3f3f46; }
    .text-slate-600, .text-gray-600, .text-zinc-600 { color: #52525b; }
    .text-slate-500, .text-gray-500, .text-zinc-500 { color: #71717a; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-base { font-size: 1rem; line-height: 1.5rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-xl { font-size: 1.25rem; line-height: 1.75rem; }
    .text-2xl { font-size: 1.5rem; line-height: 2rem; }
    .font-normal { font-weight: 400; }
    .font-medium { font-weight: 500; }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .text-center { text-align: center; }
    .shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
    .shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1); }
    .shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1); }
    .shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); }
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
            title="Copy Web Component Code"
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
                  title="Compiled Web Component Preview"
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
              Doodle a napkin wireframe on the left drawing board and click &ldquo;Compile Component&rdquo; to see instant live web component rendering with editable props.
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
