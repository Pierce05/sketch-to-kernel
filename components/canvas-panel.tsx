"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { CANVAS_PRESETS, CanvasPreset } from "@/components/canvas-presets";
import { SketchButton, SketchBadge, SketchOptionButton } from "@/components/sketch-ui";
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
  Circle,
  Type,
  CheckSquare,
  ToggleLeft,
  ChevronDown,
  Table,
  Menu,
  Scissors,
  Check,
} from "lucide-react";

interface CanvasPanelProps {
  onCompile: (imageDataUrl: string, selectedPreset?: CanvasPreset) => void;
  isCompiling: boolean;
}

interface Point {
  x: number;
  y: number;
}

export interface CanvasStroke {
  id: string;
  tool: "pen" | "rectangle" | "circle";
  points: Point[];
  color: string;
  width: number;
}

export interface DraggableStamp {
  id: string;
  type: "button" | "input" | "card" | "badge" | "checkbox" | "toggle" | "dropdown" | "table" | "navbar";
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
}

export interface CanvasTextItem {
  id: string;
  text: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
}

export type ToolType = "pen" | "rectangle" | "circle" | "eraser" | "text";
export type EraserMode = "brush" | "eradicator";

const PEN_COLORS = [
  { name: "Ballpoint Blue", hex: "#2724d1" },
  { name: "Charcoal Ink", hex: "#18181b" },
  { name: "Ruby Red", hex: "#d12724" },
  { name: "Emerald Green", hex: "#188a42" },
  { name: "Graphite Pencil", hex: "#52525b" },
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

  // Active tools
  const [activeTool, setActiveTool] = useState<ToolType>("pen");
  const [eraserMode, setEraserMode] = useState<EraserMode>("brush");
  const [penColor, setPenColor] = useState(PEN_COLORS[0].hex);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Background canvas color (Sketchbook paper white)
  const canvasBgColor = "#ffffff";

  // Full strokes collection for Eradicator & Redraw
  const [strokes, setStrokes] = useState<CanvasStroke[]>([]);
  const currentStrokePoints = useRef<Point[]>([]);
  const shapeOriginPoint = useRef<Point | null>(null);

  // Snapshots for Undo / Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  // Draggable stamps palette
  const [stamps, setStamps] = useState<DraggableStamp[]>([]);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [editingStampId, setEditingStampId] = useState<string | null>(null);
  const [isDraggingStamp, setIsDraggingStamp] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });

  // Canvas Text Items
  const [textItems, setTextItems] = useState<CanvasTextItem[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isResizingText, setIsResizingText] = useState(false);
  const [textDragOffset, setTextDragOffset] = useState<Point>({ x: 0, y: 0 });
  const textResizeStart = useRef<{ startX: number; startY: number; initialFontSize: number } | null>(null);

  // Drawer state for "Try Examples"
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<CanvasPreset | null>(null);

  // Last pointer coordinates for continuous line rendering
  const lastPointRef = useRef<Point | null>(null);
  const snapshotBeforeShape = useRef<ImageData | null>(null);

  // Redraw all strokes on canvas
  const redrawAllStrokes = useCallback((strokesToDraw: CanvasStroke[]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    strokesToDraw.forEach((stroke) => {
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (stroke.tool === "pen") {
        if (stroke.points.length === 1) {
          ctx.fillStyle = stroke.color;
          ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.width / 2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
          for (let i = 1; i < stroke.points.length; i++) {
            ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
          }
          ctx.stroke();
        }
      } else if (stroke.tool === "rectangle" && stroke.points.length >= 2) {
        const p1 = stroke.points[0];
        const p2 = stroke.points[1];
        ctx.strokeRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
      } else if (stroke.tool === "circle" && stroke.points.length >= 2) {
        const p1 = stroke.points[0];
        const p2 = stroke.points[1];
        const rx = Math.abs(p2.x - p1.x) / 2;
        const ry = Math.abs(p2.y - p1.y) / 2;
        const cx = Math.min(p1.x, p2.x) + rx;
        const cy = Math.min(p1.y, p2.y) + ry;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    });
  }, [canvasBgColor]);

  // Setup canvas backing store resolution
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    let tempCanvas: HTMLCanvasElement | null = null;
    if (canvas.width > 0 && canvas.height > 0) {
      tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx?.drawImage(canvas, 0, 0);
    }

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (tempCanvas) {
      ctx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
    } else {
      ctx.fillStyle = canvasBgColor;
      ctx.fillRect(0, 0, rect.width, rect.height);
      const initialSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      setHistory([initialSnapshot]);
    }
  }, [canvasBgColor]);

  useEffect(() => {
    setupCanvas();
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      setupCanvas();
    });
    resizeObserver.observe(container);

    return () => resizeObserver.disconnect();
  }, [setupCanvas]);

  const saveHistorySnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-20), snapshot]);
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const current = history[history.length - 1];
    const previous = history[history.length - 2];

    setRedoStack((prev) => [...prev, current]);
    setHistory((prev) => prev.slice(0, -1));

    ctx.putImageData(previous, 0, 0);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, next]);

    ctx.putImageData(next, 0, 0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);
    setStrokes([]);
    setStamps([]);
    setTextItems([]);
    setSelectedPreset(null);
    setHasDrawn(false);
    saveHistorySnapshot();
  };

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Eradicator check: does point touch stroke?
  const checkStrokeHit = (pt: Point, stroke: CanvasStroke): boolean => {
    const tolerance = Math.max(12, stroke.width * 2);

    if (stroke.tool === "pen") {
      for (const p of stroke.points) {
        if (Math.hypot(p.x - pt.x, p.y - pt.y) <= tolerance) {
          return true;
        }
      }
      return false;
    }

    if (stroke.tool === "rectangle" && stroke.points.length >= 2) {
      const p1 = stroke.points[0];
      const p2 = stroke.points[1];
      const minX = Math.min(p1.x, p2.x);
      const maxX = Math.max(p1.x, p2.x);
      const minY = Math.min(p1.y, p2.y);
      const maxY = Math.max(p1.y, p2.y);

      // Check perimeter proximity
      const nearLeft = Math.abs(pt.x - minX) <= tolerance && pt.y >= minY - tolerance && pt.y <= maxY + tolerance;
      const nearRight = Math.abs(pt.x - maxX) <= tolerance && pt.y >= minY - tolerance && pt.y <= maxY + tolerance;
      const nearTop = Math.abs(pt.y - minY) <= tolerance && pt.x >= minX - tolerance && pt.x <= maxX + tolerance;
      const nearBottom = Math.abs(pt.y - maxY) <= tolerance && pt.x >= minX - tolerance && pt.x <= maxX + tolerance;
      return nearLeft || nearRight || nearTop || nearBottom;
    }

    if (stroke.tool === "circle" && stroke.points.length >= 2) {
      const p1 = stroke.points[0];
      const p2 = stroke.points[1];
      const rx = Math.abs(p2.x - p1.x) / 2;
      const ry = Math.abs(p2.y - p1.y) / 2;
      const cx = Math.min(p1.x, p2.x) + rx;
      const cy = Math.min(p1.y, p2.y) + ry;
      if (rx === 0 || ry === 0) return false;
      const distRatio = Math.hypot((pt.x - cx) / rx, (pt.y - cy) / ry);
      return Math.abs(distRatio - 1) <= 0.35;
    }

    return false;
  };

  const eradicateAtPoint = (pt: Point) => {
    const remainingStrokes = strokes.filter((stroke) => !checkStrokeHit(pt, stroke));
    if (remainingStrokes.length !== strokes.length) {
      setStrokes(remainingStrokes);
      redrawAllStrokes(remainingStrokes);
      saveHistorySnapshot();
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(e);
    lastPointRef.current = point;
    setIsDrawing(true);
    setHasDrawn(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (activeTool === "text") {
      // Place new text item
      const newText: CanvasTextItem = {
        id: `text-${Date.now()}`,
        text: "Double-click to edit text",
        x: Math.max(10, point.x - 40),
        y: Math.max(10, point.y - 12),
        fontSize: 16,
        color: penColor,
      };
      setTextItems((prev) => [...prev, newText]);
      setSelectedTextId(newText.id);
      setActiveTool("pen");
      setIsDrawing(false);
      return;
    }

    if (activeTool === "eraser" && eraserMode === "eradicator") {
      eradicateAtPoint(point);
      return;
    }

    if (activeTool === "rectangle" || activeTool === "circle") {
      shapeOriginPoint.current = point;
      snapshotBeforeShape.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return;
    }

    if (activeTool === "pen") {
      currentStrokePoints.current = [point];
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = penColor;
      ctx.fillStyle = penColor;
      ctx.lineWidth = strokeWidth;
      ctx.arc(point.x, point.y, strokeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (activeTool === "eraser" && eraserMode === "brush") {
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = canvasBgColor;
      ctx.lineWidth = strokeWidth * 3;
      ctx.arc(point.x, point.y, (strokeWidth * 3) / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !lastPointRef.current) return;
    const currentPoint = getCanvasPoint(e);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (activeTool === "eraser" && eraserMode === "eradicator") {
      eradicateAtPoint(currentPoint);
      lastPointRef.current = currentPoint;
      return;
    }

    if (activeTool === "rectangle" || activeTool === "circle") {
      if (!shapeOriginPoint.current || !snapshotBeforeShape.current) return;
      ctx.putImageData(snapshotBeforeShape.current, 0, 0);

      ctx.beginPath();
      ctx.strokeStyle = penColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      const start = shapeOriginPoint.current;
      if (activeTool === "rectangle") {
        ctx.strokeRect(start.x, start.y, currentPoint.x - start.x, currentPoint.y - start.y);
      } else {
        const rx = Math.abs(currentPoint.x - start.x) / 2;
        const ry = Math.abs(currentPoint.y - start.y) / 2;
        const cx = Math.min(start.x, currentPoint.x) + rx;
        const cy = Math.min(start.y, currentPoint.y) + ry;
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      return;
    }

    if (activeTool === "pen") {
      currentStrokePoints.current.push(currentPoint);
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = penColor;
      ctx.lineWidth = strokeWidth;

      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();

      lastPointRef.current = currentPoint;
      return;
    }

    if (activeTool === "eraser" && eraserMode === "brush") {
      ctx.beginPath();
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = canvasBgColor;
      ctx.lineWidth = strokeWidth * 3;

      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();

      lastPointRef.current = currentPoint;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    const currentPoint = getCanvasPoint(e);

    if (activeTool === "pen" && currentStrokePoints.current.length > 0) {
      const newStroke: CanvasStroke = {
        id: `stroke-${Date.now()}-${Math.random()}`,
        tool: "pen",
        points: [...currentStrokePoints.current],
        color: penColor,
        width: strokeWidth,
      };
      setStrokes((prev) => [...prev, newStroke]);
      currentStrokePoints.current = [];
    } else if (
      (activeTool === "rectangle" || activeTool === "circle") &&
      shapeOriginPoint.current
    ) {
      const newStroke: CanvasStroke = {
        id: `shape-${Date.now()}-${Math.random()}`,
        tool: activeTool,
        points: [shapeOriginPoint.current, currentPoint],
        color: penColor,
        width: strokeWidth,
      };
      setStrokes((prev) => [...prev, newStroke]);
      shapeOriginPoint.current = null;
      snapshotBeforeShape.current = null;
    }

    setIsDrawing(false);
    lastPointRef.current = null;
    saveHistorySnapshot();
  };

  // Stamp library addition
  const addStamp = (type: DraggableStamp["type"]) => {
    const id = `stamp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    let width = 130;
    let height = 40;
    let label = "Button";

    switch (type) {
      case "button":
        width = 130;
        height = 42;
        label = "Sketch Button";
        break;
      case "input":
        width = 180;
        height = 40;
        label = "Input Field...";
        break;
      case "card":
        width = 230;
        height = 140;
        label = "Napkin Card Container";
        break;
      case "badge":
        width = 90;
        height = 28;
        label = "★ Badge";
        break;
      case "checkbox":
        width = 140;
        height = 32;
        label = "☑ Checkbox Item";
        break;
      case "toggle":
        width = 130;
        height = 36;
        label = "🔘 Toggle Switch";
        break;
      case "dropdown":
        width = 160;
        height = 38;
        label = "▾ Select Option";
        break;
      case "table":
        width = 240;
        height = 120;
        label = "⊞ Data Grid Table";
        break;
      case "navbar":
        width = 280;
        height = 48;
        label = "☰ Brand Header Nav";
        break;
    }

    const newStamp: DraggableStamp = {
      id,
      type,
      x: 60 + stamps.length * 15,
      y: 60 + stamps.length * 15,
      width,
      height,
      label,
    };

    setStamps((prev) => [...prev, newStamp]);
    setSelectedStampId(newStamp.id);
    setHasDrawn(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        const scale = Math.min(
          (rect.width * 0.9) / img.width,
          (rect.height * 0.9) / img.height,
          1
        );
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (rect.width - w) / 2;
        const y = (rect.height - h) / 2;

        ctx.fillStyle = canvasBgColor;
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, x, y, w, h);
        setHasDrawn(true);
        saveHistorySnapshot();
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: CanvasPreset) => {
    setSelectedPreset(preset);
    setIsDrawerOpen(false);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    ctx.save();
    ctx.strokeStyle = "#2724d1";
    ctx.lineWidth = 2;
    ctx.fillStyle = "#18181b";
    ctx.font = "bold 16px 'Drawably Pen', monospace";

    const startX = 35;
    const startY = 40;
    const cardWidth = Math.min(rect.width - 70, 420);
    const cardHeight = Math.min(rect.height - 80, 260);

    ctx.strokeRect(startX, startY, cardWidth, cardHeight);
    ctx.fillText(`[ WIREFRAME: ${preset.title.toUpperCase()} ]`, startX + 15, startY + 30);

    ctx.lineWidth = 1.5;
    ctx.font = "13px monospace";
    ctx.fillStyle = "#52525b";
    ctx.fillText(`Target: ${preset.category}`, startX + 15, startY + 60);

    ctx.strokeStyle = "#71717a";
    ctx.strokeRect(startX + 15, startY + 80, cardWidth - 30, 40);
    ctx.fillText("Main Component Content Slot", startX + 25, startY + 105);

    ctx.strokeStyle = "#2724d1";
    ctx.strokeRect(startX + 15, startY + 140, 140, 36);
    ctx.fillStyle = "#2724d1";
    ctx.fillText("[ Action Button ]", startX + 25, startY + 162);

    ctx.restore();
    setHasDrawn(true);
    setStamps([]);
    setTextItems([]);
    saveHistorySnapshot();
  };

  // Export crisp composite canvas for Gemma 4 AI compilation
  const exportCompositeCanvas = (): string => {
    const canvas = canvasRef.current;
    if (!canvas) return "";

    const maxDim = 960;
    const scale = Math.min(1, maxDim / Math.max(canvas.width, canvas.height, 1));
    const targetW = Math.round(canvas.width * scale);
    const targetH = Math.round(canvas.height * scale);

    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = targetW;
    tempCanvas.height = targetH;
    const ctx = tempCanvas.getContext("2d");
    if (!ctx) return canvas.toDataURL("image/jpeg", 0.9);

    // Solid white paper
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(canvas, 0, 0, targetW, targetH);

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr * scale, dpr * scale);

    // Draw Stamps
    stamps.forEach((stamp) => {
      ctx.strokeStyle = "#2724d1";
      ctx.lineWidth = 2;
      ctx.fillStyle = "rgba(39, 36, 209, 0.08)";
      ctx.strokeRect(stamp.x, stamp.y, stamp.width, stamp.height);
      ctx.fillRect(stamp.x, stamp.y, stamp.width, stamp.height);

      ctx.fillStyle = "#18181b";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(stamp.label, stamp.x + stamp.width / 2, stamp.y + stamp.height / 2);
    });

    // Draw Text Items
    textItems.forEach((item) => {
      ctx.fillStyle = item.color;
      ctx.font = `bold ${item.fontSize}px 'Drawably Pen', monospace`;
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillText(item.text, item.x, item.y);
    });

    ctx.restore();
    return tempCanvas.toDataURL("image/jpeg", 0.9);
  };

  const handleCompileClick = () => {
    const dataUrl = exportCompositeCanvas();
    onCompile(dataUrl, selectedPreset ?? undefined);
  };

  return (
    <div className="relative flex size-full flex-col overflow-hidden rounded-2xl border-2 border-[#18181b] bg-white shadow-xl">
      {/* Top Toolbox: Generously spaced tool groups */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#18181b] bg-[#eceae1] px-3 sm:px-4 py-2.5 text-xs gap-2 sm:gap-3">
          {/* Tool Group 1: Modes (Pen, Rect, Circle, Eraser, Text) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#52525b] font-bold hidden sm:inline mr-1">
            Tools:
          </span>
          <div className="flex items-center gap-1">
            <SketchOptionButton
              active={activeTool === "pen"}
              onClick={() => setActiveTool("pen")}
              className="px-2 sm:px-2.5 py-1"
              title="Freehand pen"
            >
              <PenTool className="size-3.5" />
              <span className="hidden md:inline">Pen</span>
            </SketchOptionButton>

            {/* Shape: Rectangle */}
            <SketchOptionButton
              active={activeTool === "rectangle"}
              onClick={() => setActiveTool("rectangle")}
              className="px-2 sm:px-2.5 py-1"
              title="Rectangle / Square shape tool"
            >
              <Square className="size-3.5" />
              <span className="hidden md:inline">Rect</span>
            </SketchOptionButton>

            {/* Shape: Circle */}
            <SketchOptionButton
              active={activeTool === "circle"}
              onClick={() => setActiveTool("circle")}
              className="px-2 sm:px-2.5 py-1"
              title="Circle / Ellipse shape tool"
            >
              <Circle className="size-3.5" />
              <span className="hidden md:inline">Circle</span>
            </SketchOptionButton>

            {/* Text Tool */}
            <SketchOptionButton
              active={activeTool === "text"}
              onClick={() => setActiveTool("text")}
              className="px-2 sm:px-2.5 py-1"
              title="Add Scalable Draggable Text"
            >
              <Type className="size-3.5" />
              <span className="hidden md:inline">Text</span>
            </SketchOptionButton>

            {/* Eraser */}
            <SketchOptionButton
              active={activeTool === "eraser"}
              onClick={() => setActiveTool("eraser")}
              className="px-2 sm:px-2.5 py-1"
              title="Eraser tool"
            >
              <Eraser className="size-3.5" />
              <span className="hidden md:inline">Eraser</span>
            </SketchOptionButton>
          </div>

          {/* Eraser Sub-modes: Brush vs Eradicator */}
          {activeTool === "eraser" && (
            <div className="flex items-center gap-1 animate-in fade-in duration-150">
              <SketchOptionButton
                active={eraserMode === "brush"}
                activeFill="#18181b"
                activeStroke="#18181b"
                onClick={() => setEraserMode("brush")}
                className="px-2 py-0.5 text-[11px]"
                title="Brush eraser: clears area under cursor"
              >
                Brush
              </SketchOptionButton>
              <SketchOptionButton
                active={eraserMode === "eradicator"}
                activeFill="#d12724"
                activeStroke="#d12724"
                onClick={() => setEraserMode("eradicator")}
                className="px-2 py-0.5 text-[11px]"
                title="Eradicator: touch to delete the entire stroke"
              >
                <Scissors className="size-3" />
                <span>Eradicator</span>
              </SketchOptionButton>
            </div>
          )}
        </div>

        {/* Tool Group 2: Ink Colors (Spaced) */}
        {activeTool !== "eraser" && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#52525b] font-bold hidden sm:inline">
              Ink:
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-[#18181b] bg-white px-2.5 py-1.5">
              {PEN_COLORS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => setPenColor(col.hex)}
                  className={`size-5 rounded-full transition-transform ${
                    penColor === col.hex
                      ? "scale-125 ring-2 ring-[#18181b] ring-offset-2 ring-offset-white"
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
        {activeTool !== "text" && (
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#52525b] font-bold">
              Size:
            </span>
            <div className="flex items-center gap-1">
              {STROKE_SIZES.map((sz) => (
                <SketchOptionButton
                  key={sz.size}
                  active={strokeWidth === sz.size}
                  onClick={() => setStrokeWidth(sz.size)}
                  className="px-2 py-0.5 text-xs"
                  title={`${sz.label} stroke width`}
                >
                  {sz.size}px
                </SketchOptionButton>
              ))}
            </div>
          </div>
        )}

        {/* Tool Group 4: History & Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Undo / Redo */}
          <div className="flex items-center gap-1 rounded-xl border border-[#18181b] bg-white p-1 text-[#52525b]">
            <button
              onClick={undo}
              disabled={history.length <= 1}
              className="rounded-lg p-1.5 hover:bg-[#f5f4ee] hover:text-[#18181b] disabled:opacity-30"
              title="Undo"
            >
              <RotateCcw className="size-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="rounded-lg p-1.5 hover:bg-[#f5f4ee] hover:text-[#18181b] disabled:opacity-30"
              title="Redo"
            >
              <RotateCw className="size-3.5" />
            </button>
          </div>

          {/* "Try These" Preset Drawer Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#2724d1] bg-blue-50 px-3 py-1.5 font-mono text-xs font-bold text-[#2724d1] hover:bg-blue-100 shadow-xs transition-all active:scale-95"
            title="Open example preset napkin wireframes"
          >
            <Sparkles className="size-3.5 text-[#2724d1]" />
            <span className="hidden sm:inline">Try These</span>
          </button>

          {/* Photo Dropzone */}
          <label
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#18181b] bg-white px-3 py-1.5 text-xs text-[#18181b] hover:bg-[#f5f4ee] transition-colors"
            title="Upload photo of paper wireframe"
          >
            <UploadCloud className="size-3.5 text-[#2724d1]" />
            <span className="hidden sm:inline font-mono font-semibold">Photo</span>
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
            className="flex items-center justify-center rounded-xl border border-[#d12724] bg-red-50 p-2 text-[#d12724] hover:bg-red-100 transition-colors"
            title="Clear canvas"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Pre-Made Components / Stamp Bar */}
      <div className="flex items-center gap-2 border-b border-[#18181b] bg-[#faf9f5] px-3 sm:px-4 py-2 text-xs overflow-x-auto">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#52525b] font-bold whitespace-nowrap mr-1">
          Stamps (Double-Click To Rename):
        </span>
        <button
          onClick={() => addStamp("button")}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#2724d1] bg-blue-50/60 px-2.5 py-1 text-xs font-mono text-[#2724d1] hover:bg-blue-100 transition-colors whitespace-nowrap"
        >
          <Square className="size-3" />
          <span>+ Button</span>
        </button>
        <button
          onClick={() => addStamp("input")}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#7c3aed] bg-purple-50/60 px-2.5 py-1 text-xs font-mono text-[#7c3aed] hover:bg-purple-100 transition-colors whitespace-nowrap"
        >
          <Type className="size-3" />
          <span>+ Input</span>
        </button>
        <button
          onClick={() => addStamp("card")}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#18181b] bg-gray-50 px-2.5 py-1 text-xs font-mono text-[#18181b] hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          <Layers className="size-3" />
          <span>+ Card</span>
        </button>
        <button
          onClick={() => addStamp("badge")}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#188a42] bg-emerald-50/60 px-2.5 py-1 text-xs font-mono text-[#188a42] hover:bg-emerald-100 transition-colors whitespace-nowrap"
        >
          <Check className="size-3" />
          <span>+ Badge</span>
        </button>
        <button
          onClick={() => addStamp("checkbox")}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#d12724] bg-red-50/60 px-2.5 py-1 text-xs font-mono text-[#d12724] hover:bg-red-100 transition-colors whitespace-nowrap"
        >
          <CheckSquare className="size-3" />
          <span>+ Checkbox</span>
        </button>
        <button
          onClick={() => addStamp("toggle")}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#2724d1] bg-blue-50/60 px-2.5 py-1 text-xs font-mono text-[#2724d1] hover:bg-blue-100 transition-colors whitespace-nowrap"
        >
          <ToggleLeft className="size-3" />
          <span>+ Switch</span>
        </button>
        <button
          onClick={() => addStamp("dropdown")}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#7c3aed] bg-purple-50/60 px-2.5 py-1 text-xs font-mono text-[#7c3aed] hover:bg-purple-100 transition-colors whitespace-nowrap"
        >
          <ChevronDown className="size-3" />
          <span>+ Dropdown</span>
        </button>
        <button
          onClick={() => addStamp("table")}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#18181b] bg-gray-50 px-2.5 py-1 text-xs font-mono text-[#18181b] hover:bg-gray-100 transition-colors whitespace-nowrap"
        >
          <Table className="size-3" />
          <span>+ Table</span>
        </button>
        <button
          onClick={() => addStamp("navbar")}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-[#188a42] bg-emerald-50/60 px-2.5 py-1 text-xs font-mono text-[#188a42] hover:bg-emerald-100 transition-colors whitespace-nowrap"
        >
          <Menu className="size-3" />
          <span>+ Navbar</span>
        </button>
      </div>

      {/* Main Drawing Area */}
      <div
        ref={containerRef}
        className="relative flex-1 bg-white select-none overflow-hidden bg-sketchbook-dots"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`touch-none-canvas size-full block ${
            activeTool === "text"
              ? "cursor-text"
              : activeTool === "eraser"
                ? "cursor-crosshair"
                : "cursor-crosshair"
          }`}
        />

        {/* Interactive Draggable Stamps with Double Click Rename */}
        {stamps.map((stamp) => (
          <div
            key={stamp.id}
            onPointerDown={(e) => {
              if (editingStampId === stamp.id) return;
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
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingStampId(stamp.id);
            }}
            style={{
              left: `${stamp.x}px`,
              top: `${stamp.y}px`,
              width: `${stamp.width}px`,
              height: `${stamp.height}px`,
            }}
            className={`absolute flex items-center justify-center rounded-xl border-2 border-dashed border-[#2724d1] bg-blue-50/85 font-mono text-xs text-[#18181b] cursor-move shadow-md select-none transition-shadow ${
              selectedStampId === stamp.id ? "ring-2 ring-[#2724d1] shadow-lg" : ""
            }`}
          >
            {editingStampId === stamp.id ? (
              <input
                type="text"
                autoFocus
                defaultValue={stamp.label}
                onBlur={(e) => {
                  const val = e.target.value.trim() || stamp.label;
                  setStamps((prev) =>
                    prev.map((s) => (s.id === stamp.id ? { ...s, label: val } : s))
                  );
                  setEditingStampId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                className="w-[90%] bg-white px-1.5 py-0.5 rounded border border-[#2724d1] text-xs font-mono font-bold text-[#18181b] focus:outline-none"
              />
            ) : (
              <span className="font-bold px-2 truncate pointer-events-none">{stamp.label}</span>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setStamps((prev) => prev.filter((s) => s.id !== stamp.id));
              }}
              className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-[#d12724] text-xs text-white hover:bg-red-700 shadow-xs"
              title="Remove stamp"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Scalable Draggable Canvas Text Items */}
        {textItems.map((item) => (
          <div
            key={item.id}
            onPointerDown={(e) => {
              if (editingTextId === item.id) return;
              e.stopPropagation();
              setSelectedTextId(item.id);
              setIsDraggingText(true);
              setTextDragOffset({ x: e.clientX - item.x, y: e.clientY - item.y });
            }}
            onPointerMove={(e) => {
              if (isDraggingText && selectedTextId === item.id) {
                e.stopPropagation();
                setTextItems((prev) =>
                  prev.map((t) =>
                    t.id === item.id
                      ? {
                          ...t,
                          x: Math.max(0, e.clientX - textDragOffset.x),
                          y: Math.max(0, e.clientY - textDragOffset.y),
                        }
                      : t
                  )
                );
              } else if (isResizingText && selectedTextId === item.id && textResizeStart.current) {
                e.stopPropagation();
                const delta = e.clientX - textResizeStart.current.startX + (e.clientY - textResizeStart.current.startY);
                const newSize = Math.max(
                  12,
                  Math.min(96, Math.round(textResizeStart.current.initialFontSize + delta * 0.35))
                );
                setTextItems((prev) =>
                  prev.map((t) => (t.id === item.id ? { ...t, fontSize: newSize } : t))
                );
              }
            }}
            onPointerUp={() => {
              setIsDraggingText(false);
              setIsResizingText(false);
              textResizeStart.current = null;
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              setEditingTextId(item.id);
            }}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
            }}
            className={`absolute flex items-center p-1.5 rounded-lg font-pen cursor-move select-none group border border-transparent ${
              selectedTextId === item.id ? "border-dashed border-[#2724d1] bg-blue-50/40" : "hover:border-dashed hover:border-gray-400"
            }`}
          >
            {editingTextId === item.id ? (
              <input
                type="text"
                autoFocus
                defaultValue={item.text}
                style={{ fontSize: `${item.fontSize}px`, color: item.color }}
                onBlur={(e) => {
                  const val = e.target.value.trim() || item.text;
                  setTextItems((prev) =>
                    prev.map((t) => (t.id === item.id ? { ...t, text: val } : t))
                  );
                  setEditingTextId(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
                className="bg-white px-2 py-0.5 rounded border border-[#2724d1] font-bold focus:outline-none"
              />
            ) : (
              <span
                style={{ fontSize: `${item.fontSize}px`, color: item.color }}
                className="font-bold whitespace-nowrap"
              >
                {item.text}
              </span>
            )}

            {/* Diagonal Resize Handle (Dragging increases/decreases font size) */}
            {selectedTextId === item.id && (
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  setIsResizingText(true);
                  textResizeStart.current = {
                    startX: e.clientX,
                    startY: e.clientY,
                    initialFontSize: item.fontSize,
                  };
                }}
                className="absolute -right-2 -bottom-2 flex size-4 items-center justify-center rounded-full bg-[#2724d1] text-white text-[9px] cursor-nwse-resize shadow-xs"
                title="Drag diagonally to scale font size"
              >
                ↘
              </div>
            )}

            {/* Remove Text Item Button */}
            {selectedTextId === item.id && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTextItems((prev) => prev.filter((t) => t.id !== item.id));
                }}
                className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-[#d12724] text-white text-[9px] hover:bg-red-700 shadow-xs"
                title="Remove text"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        {/* Empty Canvas Guidance */}
        {!hasDrawn && stamps.length === 0 && textItems.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="flex size-14 items-center justify-center rounded-2xl border-2 border-[#2724d1] bg-blue-50 text-[#2724d1] mb-3 shadow-xs">
              <PenTool className="size-6 stroke-[2.2]" />
            </div>
            <h4 className="text-base font-bold text-[#18181b] font-mono">
              Digital Napkin Sketchboard
            </h4>
            <p className="mt-1 text-xs text-[#52525b] max-w-sm leading-relaxed">
              Draw wireframes with freehand pen, rectangle, and circle tools. Place editable stamps or draggable scalable text!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Floating Compile Action Bar */}
      <div className="flex items-center justify-between border-t-2 border-[#18181b] bg-[#eceae1] px-3 sm:px-4 py-2.5 sm:py-3">
        <div className="flex items-center gap-2">
          {selectedPreset ? (
            <span className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-mono font-bold text-[#2724d1] border border-[#2724d1]">
              <Sparkles className="size-3.5 text-[#2724d1]" />
              Active: {selectedPreset.title}
            </span>
          ) : (
            <span className="text-xs text-[#52525b] font-mono">
              {hasDrawn || stamps.length > 0 || textItems.length > 0 ? "Ready to compile" : "Sketch on canvas"}
            </span>
          )}
        </div>

        {/* Compile Button with fresh pen re-sketch on hover */}
        <SketchButton
          variant="primary"
          onClick={handleCompileClick}
          disabled={isCompiling || (!hasDrawn && stamps.length === 0 && textItems.length === 0)}
          className="text-xs font-bold py-2.5 px-6"
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
              <Sparkles className="size-4 text-white" />
              <span>Compile Component →</span>
            </>
          )}
        </SketchButton>
      </div>

      {/* "Try These" Side Drawer */}
      {isDrawerOpen && (
        <div className="absolute inset-0 z-50 flex">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200"
          />

          <div className="relative z-10 flex h-full w-full max-w-sm flex-col border-r-2 border-[#18181b] bg-[#fcfbf9] shadow-2xl animate-in slide-in-from-left duration-250">
            <div className="flex items-center justify-between border-b-2 border-[#18181b] p-4 bg-[#eceae1]">
              <div>
                <h3 className="text-sm font-bold text-[#18181b] flex items-center gap-2 font-mono">
                  <Sparkles className="size-4 text-[#2724d1]" />
                  Select A Trial Wireframe
                </h3>
                <p className="text-xs text-[#52525b] mt-0.5">
                  Pick a napkin sketch to load and compile
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="flex size-7 items-center justify-center rounded-lg border border-[#18181b] text-[#52525b] hover:text-[#18181b] hover:bg-[#f5f4ee]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {CANVAS_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border-2 border-[#18181b] bg-white p-4 transition-all hover:bg-blue-50/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-[#2724d1] uppercase tracking-wider font-bold">
                      {preset.category}
                    </span>
                    <span className="rounded-full bg-blue-100/70 px-2 py-0.5 text-[10px] font-mono font-bold text-[#2724d1] border border-blue-300">
                      {preset.badge}
                    </span>
                  </div>

                  <h4 className="mt-1.5 text-sm font-bold text-[#18181b] group-hover:text-[#2724d1] transition-colors font-mono">
                    {preset.title}
                  </h4>

                  <p className="mt-1 text-xs text-[#52525b] leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#18181b]/20 text-[11px] text-[#71717a] group-hover:text-[#2724d1] font-mono font-medium">
                    <span>Click to load onto board</span>
                    <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-[#18181b] bg-[#eceae1] p-3 text-center">
              <span className="text-xs text-[#52525b] font-mono font-medium">
                ✏️ Draw freely or annotate over any preset!
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
