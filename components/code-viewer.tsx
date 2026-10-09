"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Check, Copy, Download, Code2 } from "lucide-react";

interface CodeViewerProps {
  code: string;
  componentName: string;
}

export function CodeViewer({ code, componentName }: CodeViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.8 },
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${componentName || "Component"}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const lines = code.split("\n");

  return (
    <div className="relative flex size-full flex-col bg-[#090a0f] font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-[#232738] bg-[#11131b] px-4 py-2 text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <Code2 className="size-3.5 text-indigo-400" />
          <span className="text-gray-200 font-semibold">{componentName}.html</span>
          <span className="text-[10px] text-gray-500 font-mono">
            ({lines.length} lines)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-lg border border-[#2b3044] bg-[#090a0f] px-2.5 py-1 text-[11px] text-gray-300 hover:border-indigo-500/50 hover:text-white transition-colors"
            title="Download pure HTML file"
          >
            <Download className="size-3" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-indigo-500 transition-all shadow-sm shadow-indigo-600/30"
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
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="flex-1 overflow-auto p-4 leading-relaxed">
        <pre className="flex font-mono text-xs text-gray-200">
          <div className="mr-4 select-none text-right font-mono text-gray-600 space-y-0.5">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <code className="flex-1 whitespace-pre overflow-x-auto text-indigo-200">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
