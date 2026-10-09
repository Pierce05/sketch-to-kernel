"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { CANVAS_PRESETS, CanvasPreset } from "@/components/canvas-presets";
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
  Palette,
  Circle,
  Square,
  Type,
  ToggleLeft,
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
  { name: "Chalk White", hex: "#f1f5f9" },
  { name: "Indigo Blue", hex: "#818cf8" },
  { name: "Neon Purple", hex: "#c084fc" },
  { name: "Emerald Mint", hex: "#34d399" },
];

const STROKE_SIZES = [
  { label: "Fine", size: 2 },
  { label: "Medium", size: 4 },
  { label: "Thick", size: 8 },
  { label: "Chunky", size: 14 },
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

  // Last pointer coordinates for smooth interpolation
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
      // Dark blackboard fill
      ctx.fillStyle = "#0c0e15";
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
    setHistory((prev) => [...prev.slice(-15), imgData]);
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
    ctx.fillStyle = "#0c0e15";
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

  // Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const pos = getPointerPos(e);
    setIsDrawing(true);
    setHasDrawn(true);
    lastPointRef.current = pos;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(pos.x, pos.y, strokeWidth / 2, 0, Math.PI * 2);
    ctx.fillStyle = activeTool === "eraser" ? "#0c0e15" : penColor;
    ctx.fill();
  };

  // Pointer Move (Smooth quadratic bezier curves for 60fps)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const currentPos = getPointerPos(e);
    const lastPos = lastPointRef.current;

    ctx.beginPath();
    ctx.strokeStyle = activeTool === "eraser" ? "#0c0e15" : penColor;
    ctx.lineWidth = activeTool === "eraser" ? strokeWidth * 2.5 : strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Quadratic curve interpolation
    const midX = (lastPos.x + currentPos.x) / 2;
    const midY = (lastPos.y + currentPos.y) / 2;

    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.quadraticCurveTo(lastPos.x, lastPos.y, midX, midY);
    ctx.stroke();

    lastPointRef.current = currentPos;
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if not captured
    }
    setIsDrawing(false);
    lastPointRef.current = null;
    saveState();
  };

  // File Upload / Real Photo Dropzone
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
        // Scale image keeping aspect ratio
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

  // Stamp tools: add hand-drawn element stamp onto the board
  const addStamp = (type: DraggableStamp["type"]) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();

    const newStamp: DraggableStamp = {
      id: `stamp-${Date.now()}`,
      type,
      x: rect.width / 2 - 70,
      y: rect.height / 2 - 30,
      width: type === "card" ? 180 : 130,
      height: type === "card" ? 120 : 40,
      label:
        type === "button"
          ? "[ Button CTA ]"
          : type === "input"
          ? "[ Text Field ]"
          : type === "card"
          ? "[ Container Box ]"
          : type === "badge"
          ? "[ Feature Badge ]"
          : "[✓] Option Check",
    };

    setStamps((prev) => [...prev, newStamp]);
    setHasDrawn(true);
  };

  // Load a preset sketch directly onto canvas
  const handleSelectPreset = (preset: CanvasPreset) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = container.getBoundingClientRect();

    // Reset background
    ctx.fillStyle = "#0c0e15";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setStamps([]);

    // Draw preset onto canvas
    preset.draw(ctx, rect.width, rect.height);
    setHasDrawn(true);
    setSelectedPreset(preset);
    saveState();
    setIsDrawerOpen(false);
  };

  // Composite canvas (draw stamps permanently into canvas raster before export)
  const exportCompositeCanvas = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return "";

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return canvas.toDataURL("image/png");

    // Copy base drawing
    ctx.drawImage(canvas, 0, 0);

    // Render stamps onto composite
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr, dpr);

    stamps.forEach((stamp) => {
      ctx.strokeStyle = "#a5b4fc";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(79, 70, 229, 0.15)";
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
    <div className="relative flex size-full flex-col overflow-hidden rounded-2xl border border-[#232738] bg-[#0c0e15] shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#232738] bg-[#11131b] px-3 py-2 text-xs">
        {/* Left Tools: Pen, Eraser, Width, Colors */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Tool switch */}
          <div className="flex items-center rounded-lg border border-[#2b3044] bg-[#090a0f] p-0.5">
            <button
              onClick={() => setActiveTool("pen")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                activeTool === "pen"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              title="Pen tool"
            >
              <PenTool className="size-3.5" />
              <span className="hidden sm:inline">Pen</span>
            </button>
            <button
              onClick={() => setActiveTool("eraser")}
              className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                activeTool === "eraser"
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              title="Eraser tool"
            >
              <Eraser className="size-3.5" />
              <span className="hidden sm:inline">Eraser</span>
            </button>
          </div>

          {/* Color Picker */}
          {activeTool === "pen" && (
            <div className="flex items-center gap-1 rounded-lg border border-[#2b3044] bg-[#090a0f] p-1">
              {PEN_COLORS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => setPenColor(col.hex)}
                  className={`size-4 rounded-full transition-all ${
                    penColor === col.hex
                      ? "ring-2 ring-white ring-offset-1 ring-offset-[#090a0f] scale-110"
                      : "opacity-60 hover:opacity-100"
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                />
              ))}
            </div>
          )}

          {/* Stroke Width Selector */}
          <div className="flex items-center rounded-lg border border-[#2b3044] bg-[#090a0f] p-0.5">
            {STROKE_SIZES.map((sz) => (
              <button
                key={sz.size}
                onClick={() => setStrokeWidth(sz.size)}
                className={`rounded px-1.5 py-0.5 text-[11px] font-mono transition-colors ${
                  strokeWidth === sz.size
                    ? "bg-gray-800 text-white font-bold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
                title={`${sz.label} stroke`}
              >
                {sz.size}px
              </button>
            ))}
          </div>

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5 text-gray-400">
            <button
              onClick={undo}
              disabled={history.length <= 1}
              className="rounded p-1 hover:bg-[#1a1d29] hover:text-white disabled:opacity-30"
              title="Undo"
            >
              <RotateCcw className="size-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="rounded p-1 hover:bg-[#1a1d29] hover:text-white disabled:opacity-30"
              title="Redo"
            >
              <RotateCw className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Right Action Tools: Stamp palette, Try Examples, File Upload, Clear */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-0">
          {/* "Try These" Drawer Button (Game Level Selector) */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/60 px-2.5 py-1 text-xs font-semibold text-indigo-300 hover:bg-indigo-900/80 transition-all shadow-sm"
            title="Open example preset napkin sketches"
          >
            <Sparkles className="size-3.5 text-indigo-400" />
            <span>Try These</span>
          </button>

          {/* File Upload Button */}
          <label
            className="flex cursor-pointer items-center gap-1 rounded-lg border border-[#2b3044] bg-[#090a0f] px-2 py-1 text-xs text-gray-300 hover:bg-[#1a1d29] transition-colors"
            title="Upload photo of paper wireframe"
          >
            <UploadCloud className="size-3.5 text-gray-400" />
            <span className="hidden md:inline">Upload Photo</span>
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
            className="flex items-center gap-1 rounded-lg border border-[#2b3044] bg-[#090a0f] p-1 text-gray-400 hover:border-red-500/40 hover:text-red-400 transition-colors"
            title="Clear canvas"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Drawably Component Stamp Strip */}
      <div className="flex items-center gap-1.5 border-b border-[#232738]/60 bg-[#0e1017] px-3 py-1.5 text-xs overflow-x-auto">
        <span className="font-mono text-[10px] uppercase tracking-wider text-gray-500 whitespace-nowrap mr-1">
          Drawably Stamps:
        </span>
        <button
          onClick={() => addStamp("button")}
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2b3044] bg-[#141722] px-2 py-0.5 text-[11px] text-gray-300 hover:border-indigo-500/60 hover:text-indigo-200 transition-colors whitespace-nowrap"
        >
          <Square className="size-3 text-indigo-400" /> + Button
        </button>
        <button
          onClick={() => addStamp("input")}
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2b3044] bg-[#141722] px-2 py-0.5 text-[11px] text-gray-300 hover:border-indigo-500/60 hover:text-indigo-200 transition-colors whitespace-nowrap"
        >
          <Type className="size-3 text-purple-400" /> + Input
        </button>
        <button
          onClick={() => addStamp("card")}
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2b3044] bg-[#141722] px-2 py-0.5 text-[11px] text-gray-300 hover:border-indigo-500/60 hover:text-indigo-200 transition-colors whitespace-nowrap"
        >
          <Layers className="size-3 text-pink-400" /> + Card Box
        </button>
        <button
          onClick={() => addStamp("badge")}
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2b3044] bg-[#141722] px-2 py-0.5 text-[11px] text-gray-300 hover:border-indigo-500/60 hover:text-indigo-200 transition-colors whitespace-nowrap"
        >
          <Circle className="size-3 text-emerald-400" /> + Badge
        </button>
        <button
          onClick={() => addStamp("checkbox")}
          className="inline-flex items-center gap-1 rounded-md border border-dashed border-[#2b3044] bg-[#141722] px-2 py-0.5 text-[11px] text-gray-300 hover:border-indigo-500/60 hover:text-indigo-200 transition-colors whitespace-nowrap"
        >
          <CheckSquare className="size-3 text-amber-400" /> + Checkbox
        </button>
      </div>

      {/* Main Drawing Surface */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full bg-[#0c0e15] overflow-hidden select-none"
      >
        {/* Background Dot Matrix */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

        {/* HTML5 Canvas */}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="touch-none-canvas size-full cursor-crosshair block"
        />

        {/* Interactive Draggable Stamps Overlay */}
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
            className="absolute flex items-center justify-center rounded-lg border-2 border-dashed border-indigo-400 bg-indigo-950/40 font-mono text-xs text-indigo-200 cursor-move shadow-lg shadow-indigo-950/50 backdrop-blur-xs select-none"
          >
            <span>{stamp.label}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setStamps((prev) => prev.filter((s) => s.id !== stamp.id));
              }}
              className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-red-600 text-[10px] text-white hover:bg-red-500"
              title="Remove stamp"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Canvas Empty State Guidance */}
        {!hasDrawn && stamps.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-indigo-500/20 bg-indigo-950/30 text-indigo-400 mb-3 shadow-inner">
              <PenTool className="size-6" />
            </div>
            <h4 className="text-sm font-semibold text-gray-300">
              Draw Your UI Wireframe Here
            </h4>
            <p className="mt-1 text-xs text-gray-500 max-w-xs">
              Use mouse, touch, or Apple Pencil. Or click &ldquo;Try These&rdquo; above to load ready-to-compile sample napkins!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Floating Compile Action Bar */}
      <div className="flex items-center justify-between border-t border-[#232738] bg-[#11131b] px-4 py-3">
        <div className="flex items-center gap-2">
          {selectedPreset ? (
            <span className="flex items-center gap-1.5 rounded-md bg-indigo-950/60 px-2 py-0.5 text-[11px] font-mono text-indigo-300 border border-indigo-800/40">
              <Sparkles className="size-3 text-indigo-400" />
              Preset: {selectedPreset.title}
            </span>
          ) : (
            <span className="text-[11px] text-gray-500 font-mono">
              {hasDrawn || stamps.length > 0 ? "Ready to compile" : "Canvas empty"}
            </span>
          )}
        </div>

        {/* Compile Button */}
        <button
          onClick={handleCompileClick}
          disabled={isCompiling || (!hasDrawn && stamps.length === 0)}
          className="group relative flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] hover:shadow-indigo-600/50 active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
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
              <span>Compiling with Gemma 4...</span>
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
          {/* Backdrop blur click to close */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
          />

          {/* Slide-out drawer panel on left */}
          <div className="relative z-10 flex h-full w-full max-w-sm flex-col border-r border-[#2b3044] bg-[#0c0e15] shadow-2xl animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-[#232738] p-4 bg-[#11131b]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="size-4 text-indigo-400" />
                  Select A Trial Wireframe
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Pick a napkin preset to load and compile
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex size-7 items-center justify-center rounded-lg border border-[#2b3044] text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Vertical Carousel / Level Selector List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {CANVAS_PRESETS.map((preset, index) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-[#2b3044] bg-[#11131b] p-4 transition-all hover:border-indigo-500/60 hover:bg-[#161926] hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                      {preset.category}
                    </span>
                    <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300 border border-indigo-500/30">
                      {preset.badge}
                    </span>
                  </div>

                  <h4 className="mt-1.5 text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {preset.title}
                  </h4>

                  <p className="mt-1 text-xs text-gray-400 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#232738]/60 text-[11px] text-gray-500 group-hover:text-indigo-400 font-mono">
                    <span>Click to load onto board</span>
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-[#232738] bg-[#11131b] p-3 text-center">
              <span className="text-[11px] text-gray-500">
                Tip: You can draw over or add stamps to any preset!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
