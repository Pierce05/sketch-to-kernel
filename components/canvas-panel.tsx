"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { CANVAS_PRESETS, CanvasPreset } from "@/components/canvas-presets";
import { SketchButton, SketchCard, SketchBadge } from "@/components/sketch-ui";
import {
  PenTool,
  Eraser,
  RotateCcw,
  RotateCw,
  Trash2,
  UploadCloud,
  Sparkles,
  Layers,
  ChevronRight,
  X,
  Square,
  Type,
  Circle,
  CheckSquare,
} from "lucide-react";

interface CanvasPanelProps {
  onCompile: (imageDataUrl: string, selectedPreset?: CanvasPreset) => void;
  isCompiling: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface DraggableStamp {
  id: string;
  type: "button" | "input" | "card" | "badge" | "checkbox";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

const PEN_COLORS = [
  { name: "Blue Ink", hex: "#2563eb" },
  { name: "Graphite Black", hex: "#0f172a" },
  { name: "Chalk White", hex: "#f8fafc" },
  { name: "Ruby Red", hex: "#e11d48" },
  { name: "Mint Green", hex: "#10b981" },
];

const STROKE_SIZES = [
  { label: "Fine", size: 2 },
  { label: "Normal", size: 4 },
  { label: "Bold", size: 7 },
  { label: "Marker", size: 14 },
];

export function CanvasPanel({ onCompile, isCompiling }: CanvasPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Drawing state
  const [activeTool, setActiveTool] = useState<"pen" | "eraser">("pen");
  const [penColor, setPenColor] = useState(PEN_COLORS[0].hex);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Background canvas color (Sketchbook paper)
  const canvasBgColor = "#0f111a";

  // Undo / Redo history
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Draggable stamps palette
  const [stamps, setStamps] = useState<DraggableStamp[]>([]);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [isDraggingStamp, setIsDraggingStamp] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // Drawer state for "Try Examples"
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<CanvasPreset | null>(null);

  // Last pointer coordinates for continuous line rendering
  const lastPointRef = useRef<Point | null>(null);

  // Initialize canvas backing store resolution
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Preserve existing canvas pixels across resize if available
    let tempCanvas: HTMLCanvasElement | null = null;
    if (canvas.width > 0 && canvas.height > 0) {
      tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tCtx = tempCanvas.getContext("2d");
      tCtx?.drawImage(canvas, 0, 0);
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tempCanvas) {
      ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    } else {
      ctx.fillStyle = canvasBgColor;
      ctx.fillRect(0, 0, rect.width, rect.height);
      saveState();
    }
  }, []);

  useEffect(() => {
    setupCanvas();
    window.addEventListener("resize", setupCanvas);
    return () => window.removeEventListener("resize", setupCanvas);
  }, [setupCanvas]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-20), imgData]);
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const current = history[history.length - 1];
    const previous = history[history.length - 2];

    setRedoStack((prev) => [...prev, current]);
    setHistory((prev) => prev.slice(0, -1));
    ctx.putImageData(previous, 0, 0);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, next]);
    ctx.putImageData(next, 0, 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);
    setStamps([]);
    setHasDrawn(false);
    setSelectedPreset(null);
    saveState();
  };

  // Coordinates helper
  const getPointerPos = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Pointer Down: Start continuous stroke
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pos = getPointerPos(e);
    setIsDrawing(true);
    setHasDrawn(true);
    lastPointRef.current = pos;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Immediate initial dab so even a quick tap makes a mark
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = activeTool === "eraser" ? canvasBgColor : penColor;
    ctx.fill();
  };

  // Pointer Move: 100% Solid Continuous Unbroken Stroke (Fixes dotted line issue)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const currentPos = getPointerPos(e);
    const lastPos = lastPointRef.current;

    ctx.beginPath();
    ctx.strokeStyle = activeTool === "eraser" ? canvasBgColor : penColor;
    ctx.lineWidth = activeTool === "eraser" ? strokeWidth * 3.5 : strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Continuous lineTo guarantees zero gaps or dots
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(currentPos.x, currentPos.y);
    ctx.stroke();

    lastPointRef.current = currentPos;
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore
    }
    setIsDrawing(false);
    lastPointRef.current = null;
    saveState();
  };

  // File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = container.getBoundingClientRect();
        const scale = Math.min((rect.width * 0.9) / img.width, (rect.height * 0.9) / img.height);
        const nw = img.width * scale;
        const nh = img.height * scale;
        const nx = (rect.width - nw) / 2;
        const ny = (rect.height - nh) / 2;

        ctx.drawImage(img, nx, ny, nw, nh);
        setHasDrawn(true);
        saveState();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Stamp tools: add hand-drawn element stamp onto board
  const addStamp = (type: DraggableStamp["type"]) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const newStamp: DraggableStamp = {
      id: `stamp-${Date.now()}`,
      type,
      x: rect.width / 2 - 75,
      y: rect.height / 2 - 25,
      width: type === "card" ? 180 : 130,
      height: type === "card" ? 120 : 40,
      label:
        type === "button"
          ? "[ CTA Button ]"
          : type === "input"
          ? "[ User Input ]"
          : type === "card"
          ? "[ Project Card ]"
          : type === "badge"
          ? "[ Track Badge ]"
          : "[✓] Upvote",
    };

    setStamps((prev) => [...prev, newStamp]);
    setHasDrawn(true);
  };

  // Load a preset sketch onto canvas
  const handleSelectPreset = (preset: CanvasPreset) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();

    // Reset background
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);
    setStamps([]);

    // Draw preset onto canvas
    preset.draw(ctx, rect.width, rect.height);
    setHasDrawn(true);
    setSelectedPreset(preset);
    saveState();
    setIsDrawerOpen(false);
  };

  // Composite canvas for export
  const exportCompositeCanvas = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return "";

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return canvas.toDataURL("image/png");

    ctx.drawImage(canvas, 0, 0);

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);

    stamps.forEach((stamp) => {
      ctx.strokeStyle = "#4f46e5";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(79, 70, 229, 0.12)";
      ctx.strokeRect(stamp.x, stamp.y, stamp.width, stamp.height);
      ctx.fillRect(stamp.x, stamp.y, stamp.width, stamp.height);

      ctx.fillStyle = "#e0e7ff";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stamp.label, stamp.x + stamp.width / 2, stamp.y + stamp.height / 2);
    });

    ctx.restore();
    return tempCanvas.toDataURL("image/png");
  };

  const handleCompileClick = () => {
    const dataUrl = exportCompositeCanvas();
    onCompile(dataUrl, selectedPreset ?? undefined);
  };

  return (
    <div className="relative flex size-full flex-col overflow-hidden rounded-2xl border-2 border-[#2b3044] bg-[#0c0e15] shadow-2xl">
      {/* Top Toolbox: Generously spaced tool groups */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#232738] bg-[#131520] px-4 py-2.5 text-xs gap-3">
        {/* Tool Group 1: Pen / Eraser Modes */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400 font-semibold mr-1">
            Tools:
          </span>
          <div className="flex items-center gap-1 rounded-xl border border-[#2b3044] bg-[#0a0b10] p-1">
            <button
              onClick={() => setActiveTool("pen")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                activeTool === "pen"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Pen tool"
            >
              <PenTool className="size-3.5" />
              <span>Pen</span>
            </button>
            <button
              onClick={() => setActiveTool("eraser")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-semibold transition-all ${
                activeTool === "eraser"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
              title="Eraser tool"
            >
              <Eraser className="size-3.5" />
              <span>Eraser</span>
            </button>
          </div>
        </div>

        {/* Tool Group 2: Ink Colors (Spaced) */}
        {activeTool === "pen" && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
              Ink:
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-[#2b3044] bg-[#0a0b10] px-2.5 py-1.5">
              {PEN_COLORS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => setPenColor(col.hex)}
                  className={`size-5 rounded-full transition-transform ${
                    penColor === col.hex
                      ? "scale-125 ring-2 ring-white ring-offset-2 ring-offset-[#0a0b10]"
                      : "opacity-60 hover:opacity-100 hover:scale-110"
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tool Group 3: Stroke Widths (Spaced) */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
            Size:
          </span>
          <div className="flex items-center gap-1.5 rounded-xl border border-[#2b3044] bg-[#0a0b10] p-1">
            {STROKE_SIZES.map((sz) => (
              <button
                key={sz.size}
                onClick={() => setStrokeWidth(sz.size)}
                className={`rounded-lg px-2.5 py-1 text-xs font-mono transition-colors ${
                  strokeWidth === sz.size
                    ? "bg-indigo-700 text-white font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
                title={`${sz.label} stroke width`}
              >
                {sz.size}px
              </button>
            ))}
          </div>
        </div>

        {/* Tool Group 4: History & Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 rounded-xl border border-[#2b3044] bg-[#0a0b10] p-1 text-gray-400">
            <button
              onClick={undo}
              disabled={history.length <= 1}
              className="rounded-lg p-1.5 hover:bg-gray-800 hover:text-white disabled:opacity-30"
              title="Undo"
            >
              <RotateCcw className="size-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="rounded-lg p-1.5 hover:bg-gray-800 hover:text-white disabled:opacity-30"
              title="Redo"
            >
              <RotateCw className="size-3.5" />
            </button>
          </div>

          {/* "Try These" Preset Drawer Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border-2 border-indigo-500/60 bg-indigo-950/70 px-3.5 py-1.5 font-mono text-xs font-bold text-indigo-300 hover:bg-indigo-900 shadow-md transition-all active:scale-95"
            title="Open example preset napkin wireframes"
          >
            <Sparkles className="size-3.5 text-indigo-400" />
            <span>Try These</span>
          </button>

          {/* Photo Dropzone */}
          <label
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#2b3044] bg-[#0a0b10] px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-800 transition-colors"
            title="Upload photo of paper wireframe"
          >
            <UploadCloud className="size-3.5 text-indigo-400" />
            <span className="hidden sm:inline font-mono">Photo</span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {/* Clear Button */}
          <button
            onClick={clearCanvas}
            className="flex items-center justify-center rounded-xl border border-red-900/40 bg-red-950/20 p-2 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-colors"
            title="Clear canvas"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Drawably Element Stamp Bar */}
      <div className="flex items-center gap-2 border-b border-[#232738] bg-[#0e1017] px-4 py-2 text-xs overflow-x-auto">
        <span className="font-mono text-[10px] uppercase tracking-wider text-gray-400 font-bold whitespace-nowrap mr-1">
          Drawably Stamps:
        </span>
        <button
          onClick={() => addStamp("button")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-indigo-500/40 bg-indigo-950/30 px-3 py-1 text-xs font-mono text-indigo-200 hover:border-indigo-400 hover:bg-indigo-900/40 transition-colors whitespace-nowrap"
        >
          <Square className="size-3 text-indigo-400" /> + Button
        </button>
        <button
          onClick={() => addStamp("input")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-purple-500/40 bg-purple-950/30 px-3 py-1 text-xs font-mono text-purple-200 hover:border-purple-400 hover:bg-purple-900/40 transition-colors whitespace-nowrap"
        >
          <Type className="size-3 text-purple-400" /> + Input
        </button>
        <button
          onClick={() => addStamp("card")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-pink-500/40 bg-pink-950/30 px-3 py-1 text-xs font-mono text-pink-200 hover:border-pink-400 hover:bg-pink-900/40 transition-colors whitespace-nowrap"
        >
          <Layers className="size-3 text-pink-400" /> + Card Box
        </button>
        <button
          onClick={() => addStamp("badge")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-500/40 bg-emerald-950/30 px-3 py-1 text-xs font-mono text-emerald-200 hover:border-emerald-400 hover:bg-emerald-900/40 transition-colors whitespace-nowrap"
        >
          <Circle className="size-3 text-emerald-400" /> + Badge
        </button>
        <button
          onClick={() => addStamp("checkbox")}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-amber-500/40 bg-amber-950/30 px-3 py-1 text-xs font-mono text-amber-200 hover:border-amber-400 hover:bg-amber-900/40 transition-colors whitespace-nowrap"
        >
          <CheckSquare className="size-3 text-amber-400" /> + Upvote
        </button>
      </div>

      {/* Main Drawing Canvas Surface */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full bg-[#0f111a] overflow-hidden select-none"
      >
        {/* Subtle Graph Paper Pattern */}
        <div className="absolute inset-0 bg-dot-matrix opacity-25 pointer-events-none" />

        {/* Smooth HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="touch-none-canvas size-full cursor-crosshair block"
        />

        {/* Interactive Draggable Stamps */}
        {stamps.map((stamp) => (
          <div
            key={stamp.id}
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelectedStampId(stamp.id);
              setIsDraggingStamp(true);
              setDragOffset({ x: e.clientX - stamp.x, y: e.clientY - stamp.y });
            }}
            onPointerMove={(e) => {
              if (isDraggingStamp && selectedStampId === stamp.id) {
                e.stopPropagation();
                setStamps((prev) =>
                  prev.map((s) =>
                    s.id === stamp.id
                      ? {
                          ...s,
                          x: Math.max(0, e.clientX - dragOffset.x),
                          y: Math.max(0, e.clientY - dragOffset.y),
                        }
                      : s
                  )
                );
              }
            }}
            onPointerUp={() => setIsDraggingStamp(false)}
            style={{
              left: `${stamp.x}px`,
              top: `${stamp.y}px`,
              width: `${stamp.width}px`,
              height: `${stamp.height}px`,
            }}
            className="absolute flex items-center justify-center rounded-xl border-2 border-dashed border-indigo-400 bg-indigo-950/60 font-mono text-xs text-indigo-200 cursor-move shadow-xl backdrop-blur-xs select-none"
          >
            <span>{stamp.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStamps((prev) => prev.filter((s) => s.id !== stamp.id));
              }}
              className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-red-600 text-xs text-white hover:bg-red-500 shadow"
              title="Remove stamp"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Empty Canvas Guidance */}
        {!hasDrawn && stamps.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="flex size-14 items-center justify-center rounded-2xl border-2 border-indigo-500/40 bg-indigo-950/40 text-indigo-400 mb-3 shadow-inner">
              <PenTool className="size-6" />
            </div>
            <h4 className="text-base font-bold text-gray-200 font-mono">
              Digital Napkin Sketchboard
            </h4>
            <p className="mt-1 text-xs text-gray-400 max-w-sm leading-relaxed">
              Draw your wireframe freely with mouse or stylus. Click &ldquo;Try These&rdquo; above to load ready-to-test hackathon napkin presets!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Floating Compile Action Bar */}
      <div className="flex items-center justify-between border-t-2 border-[#232738] bg-[#131520] px-4 py-3">
        <div className="flex items-center gap-2">
          {selectedPreset ? (
            <span className="flex items-center gap-1.5 rounded-lg bg-indigo-950/80 px-2.5 py-1 text-xs font-mono font-bold text-indigo-300 border border-indigo-700/60">
              <Sparkles className="size-3.5 text-indigo-400" />
              Active: {selectedPreset.title}
            </span>
          ) : (
            <span className="text-xs text-gray-400 font-mono">
              {hasDrawn || stamps.length > 0 ? "Ready to compile" : "Sketch on canvas"}
            </span>
          )}
        </div>

        {/* Compile Button */}
        <button
          onClick={handleCompileClick}
          disabled={isCompiling || (!hasDrawn && stamps.length === 0)}
          className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2.5 text-xs font-mono font-bold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
        >
          {isCompiling ? (
            <>
              <svg
                className="size-4 animate-spin text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
              <span>Gemma 4 Inferencing...</span>
            </>
          ) : (
            <>
              <Sparkles className="size-4 text-white transition-transform group-hover:rotate-12" />
              <span>Compile Component →</span>
            </>
          )}
        </button>
      </div>

      {/* "Try These" Side Drawer (Game Level Selector style) */}
      {isDrawerOpen && (
        <div className="absolute inset-0 z-50 flex">
          {/* Backdrop blur */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          />

          {/* Drawer */}
          <div className="relative z-10 flex h-full w-full max-w-sm flex-col border-r-2 border-[#2b3044] bg-[#0c0e15] shadow-2xl animate-in slide-in-from-left duration-250">
            <div className="flex items-center justify-between border-b-2 border-[#232738] p-4 bg-[#131520]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                  <Sparkles className="size-4 text-indigo-400" />
                  Select A Trial Wireframe
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Pick a napkin sketch to load and compile
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex size-7 items-center justify-center rounded-lg border border-[#2b3044] text-gray-400 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {CANVAS_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-[#2b3044] bg-[#131520] p-4 transition-all hover:border-indigo-500 hover:bg-[#1a1d2e] hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-bold">
                      {preset.category}
                    </span>
                    <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-indigo-300 border border-indigo-500/30">
                      {preset.badge}
                    </span>
                  </div>

                  <h4 className="mt-1.5 text-sm font-bold text-white group-hover:text-indigo-300 transition-colors font-mono">
                    {preset.title}
                  </h4>

                  <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#232738] text-[11px] text-gray-500 group-hover:text-indigo-400 font-mono font-medium">
                    <span>Click to load onto board</span>
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[#232738] bg-[#131520] p-3 text-center">
              <span className="text-xs text-gray-400 font-mono">
                ✏️ Draw freely or annotate over any preset!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
