"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Check, Copy, Download, Code2 } from "lucide-react";
import { SketchButton } from "@/components/sketch-ui";

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
    <div className="relative flex size-full flex-col bg-[#18181b] font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b-2 border-[#18181b] bg-[#eceae1] px-4 py-2 text-xs">
        <div className="flex items-center gap-2 text-[#18181b]">
          <Code2 className="size-3.5 text-[#2724d1]" />
          <span className="font-bold font-mono text-[#18181b]">{componentName}.html</span>
          <span className="text-[10px] text-[#52525b] font-mono">
            ({lines.length} lines)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 rounded-lg border border-[#18181b] bg-white px-2.5 py-1 text-[11px] font-mono font-semibold text-[#18181b] hover:bg-[#f5f4ee] transition-colors"
            title="Download pure HTML file"
          >
            <Download className="size-3" />
            <span className="hidden sm:inline">Download</span>
          </button>

          <SketchButton
            variant="primary"
            onClick={handleCopy}
            className="text-[11px] font-bold py-1 px-3"
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
          </SketchButton>
        </div>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="flex-1 overflow-auto p-4 leading-relaxed">
        <pre className="flex font-mono text-xs text-gray-100">
          <div className="mr-4 select-none text-right font-mono text-gray-500 space-y-0.5">
            {lines.map((_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <code className="flex-1 whitespace-pre overflow-x-auto text-blue-200">
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}
