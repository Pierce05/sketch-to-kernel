"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { CANVAS_PRESETS, CanvasPreset } from "@/components/canvas-presets";
import { SketchButton, SketchOptionButton } from "@/components/sketch-ui";
import { ApiKeyMode, CustomProvider } from "@/lib/types";
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
  MousePointer,
} from "lucide-react";

interface CanvasPanelProps {
  onCompile: (
    imageDataUrl: string,
    selectedPreset?: CanvasPreset,
    wireframeDescription?: string
  ) => void;
  isCompiling: boolean;
  compileProvider?: CustomProvider;
  compileModelId?: string;
  apiKeyMode?: ApiKeyMode;
}

interface Point {
  x: number;
  y: number;
}

export interface CanvasStroke {
  id: string;
  tool: "pen";
  points: Point[];
  color: string;
  width: number;
}

export interface CanvasShape {
  id: string;
  type: "rectangle" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

export interface DraggableStamp {
  id: string;
  type:
    | "button"
    | "input"
    | "card"
    | "badge"
    | "checkbox"
    | "toggle"
    | "dropdown"
    | "table"
    | "navbar";
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

export interface HistorySnapshot {
  strokes: CanvasStroke[];
  shapes: CanvasShape[];
  stamps: DraggableStamp[];
  textItems: CanvasTextItem[];
  canvasImageData?: ImageData;
}

export type ToolType = "select" | "pen" | "rectangle" | "circle" | "eraser" | "text";
export type EraserMode = "brush" | "eradicator";
type ResizeHandleType = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

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

// Distance from point to line segment
function distToSegment(p: Point, v: Point, w: Point): number {
  const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

export function CanvasPanel({
  onCompile,
  isCompiling,
  compileProvider,
  compileModelId,
  apiKeyMode,
}: CanvasPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active tools
  const [activeTool, setActiveTool] = useState<ToolType>("pen");
  const [eraserMode, setEraserMode] = useState<EraserMode>("brush");
  const [penColor, setPenColor] = useState(PEN_COLORS[0].hex);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Background canvas color (paper white)
  const canvasBgColor = "#ffffff";

  // Freehand Pen Strokes collection
  const [strokes, setStrokes] = useState<CanvasStroke[]>([]);
  const currentStrokePoints = useRef<Point[]>([]);

  // Interactive Resizable & Draggable Shapes
  const [shapes, setShapes] = useState<CanvasShape[]>([]);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isDraggingShape, setIsDraggingShape] = useState(false);
  const [isResizingShape, setIsResizingShape] = useState(false);
  const [shapeDragOffset, setShapeDragOffset] = useState<Point>({ x: 0, y: 0 });
  const activeResizeHandle = useRef<ResizeHandleType | null>(null);
  const shapeResizeOrigin = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

  // Origin for creating new rectangle / circle
  const shapeCreationOrigin = useRef<Point | null>(null);
  const [shapePreview, setShapePreview] = useState<{
    type: "rectangle" | "circle";
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    strokeWidth: number;
  } | null>(null);

  // Draggable stamps palette
  const [stamps, setStamps] = useState<DraggableStamp[]>([]);
  const [selectedStampId, setSelectedStampId] = useState<string | null>(null);
  const [editingStampId, setEditingStampId] = useState<string | null>(null);
  const [isDraggingStamp, setIsDraggingStamp] = useState(false);
  const [isResizingStamp, setIsResizingStamp] = useState(false);
  const [dragOffset, setDragOffset] = useState<Point>({ x: 0, y: 0 });
  const activeStampResizeHandle = useRef<ResizeHandleType | null>(null);
  const stampResizeOrigin = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialWidth: number;
    initialHeight: number;
  } | null>(null);

  // Canvas Text Items
  const [textItems, setTextItems] = useState<CanvasTextItem[]>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isResizingText, setIsResizingText] = useState(false);
  const [textDragOffset, setTextDragOffset] = useState<Point>({ x: 0, y: 0 });
  const textResizeStart = useRef<{
    startX: number;
    startY: number;
    initialFontSize: number;
  } | null>(null);

  // Comprehensive Multi-Layer Snapshots for Undo / Redo
  const [history, setHistory] = useState<HistorySnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<HistorySnapshot[]>([]);

  // Drawer state for "Try Examples"
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<CanvasPreset | null>(null);

  // Pointer tracking
  const lastPointRef = useRef<Point | null>(null);

  // Redraw all freehand pen strokes on canvas
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
    });
  }, [canvasBgColor]);

  // Capture full multi-layer history snapshot
  const takeSnapshot = useCallback(
    (
      customStrokes?: CanvasStroke[],
      customShapes?: CanvasShape[],
      customStamps?: DraggableStamp[],
      customTextItems?: CanvasTextItem[]
    ) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const canvasImageData =
        canvas && ctx ? ctx.getImageData(0, 0, canvas.width, canvas.height) : undefined;

      const snapshot: HistorySnapshot = {
        strokes: JSON.parse(JSON.stringify(customStrokes ?? strokes)),
        shapes: JSON.parse(JSON.stringify(customShapes ?? shapes)),
        stamps: JSON.parse(JSON.stringify(customStamps ?? stamps)),
        textItems: JSON.parse(JSON.stringify(customTextItems ?? textItems)),
        canvasImageData,
      };

      setHistory((prev) => [...prev.slice(-30), snapshot]);
      setRedoStack([]);
    },
    [strokes, shapes, stamps, textItems]
  );

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
      setHistory([
        {
          strokes: [],
          shapes: [],
          stamps: [],
          textItems: [],
          canvasImageData: initialSnapshot,
        },
      ]);
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

  // Full multi-layer Undo
  const undo = useCallback(() => {
    if (history.length <= 1) return;
    const current = history[history.length - 1];
    const previous = history[history.length - 2];

    setRedoStack((prev) => [...prev, current]);
    setHistory((prev) => prev.slice(0, -1));

    // Restore multi-layer state
    setStrokes(previous.strokes);
    setShapes(previous.shapes);
    setStamps(previous.stamps);
    setTextItems(previous.textItems);
    setSelectedShapeId(null);
    setSelectedStampId(null);
    setSelectedTextId(null);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (previous.canvasImageData) {
          ctx.putImageData(previous.canvasImageData, 0, 0);
        } else {
          redrawAllStrokes(previous.strokes);
        }
      }
    }
  }, [history, redrawAllStrokes]);

  // Full multi-layer Redo
  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];

    setRedoStack((prev) => prev.slice(0, -1));
    setHistory((prev) => [...prev, next]);

    // Restore multi-layer state
    setStrokes(next.strokes);
    setShapes(next.shapes);
    setStamps(next.stamps);
    setTextItems(next.textItems);
    setSelectedShapeId(null);
    setSelectedStampId(null);
    setSelectedTextId(null);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (next.canvasImageData) {
          ctx.putImageData(next.canvasImageData, 0, 0);
        } else {
          redrawAllStrokes(next.strokes);
        }
      }
    }
  }, [redoStack, redrawAllStrokes]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, rect.width, rect.height);
    setStrokes([]);
    setShapes([]);
    setStamps([]);
    setTextItems([]);
    setSelectedShapeId(null);
    setSelectedStampId(null);
    setSelectedTextId(null);
    setSelectedPreset(null);
    setHasDrawn(false);
    takeSnapshot([], [], [], []);
  };

  // Keyboard Shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+S, V, P, R, C, T, E, Delete)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (isCtrlOrCmd && (e.key === "z" || e.key === "Z")) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if (isCtrlOrCmd && (e.key === "y" || e.key === "Y")) {
        e.preventDefault();
        redo();
        return;
      }

      if (isCtrlOrCmd && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        setActiveTool("select");
        return;
      }

      if (!isCtrlOrCmd && !e.altKey) {
        const k = e.key.toLowerCase();
        if (k === "v") {
          setActiveTool("select");
        } else if (k === "p") {
          setActiveTool("pen");
        } else if (k === "r") {
          setActiveTool("rectangle");
        } else if (k === "c") {
          setActiveTool("circle");
        } else if (k === "t") {
          setActiveTool("text");
        } else if (k === "e") {
          setActiveTool("eraser");
        } else if (e.key === "Delete" || e.key === "Backspace") {
          if (selectedShapeId) {
            const nextShapes = shapes.filter((s) => s.id !== selectedShapeId);
            setShapes(nextShapes);
            setSelectedShapeId(null);
            takeSnapshot(strokes, nextShapes, stamps, textItems);
          } else if (selectedStampId) {
            const nextStamps = stamps.filter((s) => s.id !== selectedStampId);
            setStamps(nextStamps);
            setSelectedStampId(null);
            takeSnapshot(strokes, shapes, nextStamps, textItems);
          } else if (selectedTextId) {
            const nextTexts = textItems.filter((t) => t.id !== selectedTextId);
            setTextItems(nextTexts);
            setSelectedTextId(null);
            takeSnapshot(strokes, shapes, stamps, nextTexts);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    undo,
    redo,
    selectedShapeId,
    selectedStampId,
    selectedTextId,
    shapes,
    stamps,
    textItems,
    strokes,
    takeSnapshot,
  ]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement | HTMLDivElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // Eradicator helper: Calculate minimum distance from pointer to a stroke's path
  const getStrokeDistance = (pt: Point, stroke: CanvasStroke): number => {
    if (stroke.points.length === 0) return Infinity;
    if (stroke.points.length === 1) {
      return Math.hypot(stroke.points[0].x - pt.x, stroke.points[0].y - pt.y);
    }
    let minD = Infinity;
    for (let i = 0; i < stroke.points.length - 1; i++) {
      const d = distToSegment(pt, stroke.points[i], stroke.points[i + 1]);
      if (d < minD) minD = d;
    }
    return minD;
  };

  // Eradicate exactly the single closest stroke touched, without deleting crossed lines
  const eradicateClosestStroke = (pt: Point) => {
    const tolerance = 16;
    let closestId: string | null = null;
    let closestDist = tolerance;

    strokes.forEach((stroke) => {
      const d = getStrokeDistance(pt, stroke);
      if (d <= closestDist) {
        closestDist = d;
        closestId = stroke.id;
      }
    });

    if (closestId) {
      const remaining = strokes.filter((s) => s.id !== closestId);
      setStrokes(remaining);
      redrawAllStrokes(remaining);
      takeSnapshot(remaining, shapes, stamps, textItems);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isCompiling) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(e);
    lastPointRef.current = point;

    // Eradicator Mode: find and remove only the single touched stroke
    if (activeTool === "eraser" && eraserMode === "eradicator") {
      eradicateClosestStroke(point);
      return;
    }

    if (activeTool === "select") {
      // Clicked on empty canvas background: deselect active elements
      setSelectedShapeId(null);
      setSelectedStampId(null);
      setSelectedTextId(null);
      return;
    }

    if (activeTool === "text") {
      // Place new text item and auto-transition to select mode
      const newText: CanvasTextItem = {
        id: `text-${Date.now()}`,
        text: "Double-click text to edit",
        x: Math.max(10, point.x - 30),
        y: Math.max(10, point.y - 12),
        fontSize: 18,
        color: penColor,
      };
      const nextTexts = [...textItems, newText];
      setTextItems(nextTexts);
      setSelectedTextId(newText.id);
      setSelectedShapeId(null);
      setSelectedStampId(null);
      setActiveTool("select"); // Auto-shift to select mode
      setHasDrawn(true);
      takeSnapshot(strokes, shapes, stamps, nextTexts);
      return;
    }

    if (activeTool === "rectangle" || activeTool === "circle") {
      shapeCreationOrigin.current = point;
      setShapePreview({
        type: activeTool,
        x: point.x,
        y: point.y,
        width: 0,
        height: 0,
        color: penColor,
        strokeWidth,
      });
      return;
    }

    setIsDrawing(true);
    setHasDrawn(true);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
    if (isCompiling) return;
    const currentPoint = getCanvasPoint(e);

    // Live preview for drawing rectangle / circle
    if (
      (activeTool === "rectangle" || activeTool === "circle") &&
      shapeCreationOrigin.current
    ) {
      const origin = shapeCreationOrigin.current;
      const x = Math.min(origin.x, currentPoint.x);
      const y = Math.min(origin.y, currentPoint.y);
      const width = Math.abs(currentPoint.x - origin.x);
      const height = Math.abs(currentPoint.y - origin.y);
      setShapePreview({
        type: activeTool,
        x,
        y,
        width,
        height,
        color: penColor,
        strokeWidth,
      });
      return;
    }

    if (!isDrawing || !lastPointRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    const currentPoint = getCanvasPoint(e);

    // Finish creating rectangle / circle: convert into interactive shape & auto-shift to select
    if (
      (activeTool === "rectangle" || activeTool === "circle") &&
      shapeCreationOrigin.current
    ) {
      const origin = shapeCreationOrigin.current;
      const x = Math.min(origin.x, currentPoint.x);
      const y = Math.min(origin.y, currentPoint.y);
      const width = Math.abs(currentPoint.x - origin.x);
      const height = Math.abs(currentPoint.y - origin.y);

      if (width >= 8 && height >= 8) {
        const newShape: CanvasShape = {
          id: `shape-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          type: activeTool,
          x,
          y,
          width,
          height,
          color: penColor,
          strokeWidth,
        };
        const nextShapes = [...shapes, newShape];
        setShapes(nextShapes);
        setSelectedShapeId(newShape.id);
        setSelectedStampId(null);
        setSelectedTextId(null);
        setHasDrawn(true);
        setActiveTool("select"); // Automatic shift to select mode
        takeSnapshot(strokes, nextShapes, stamps, textItems);
      }

      shapeCreationOrigin.current = null;
      setShapePreview(null);
      return;
    }

    if (!isDrawing) return;

    if (activeTool === "pen" && currentStrokePoints.current.length > 0) {
      const newStroke: CanvasStroke = {
        id: `stroke-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tool: "pen",
        points: [...currentStrokePoints.current],
        color: penColor,
        width: strokeWidth,
      };
      const nextStrokes = [...strokes, newStroke];
      setStrokes(nextStrokes);
      currentStrokePoints.current = [];
      takeSnapshot(nextStrokes, shapes, stamps, textItems);
    }

    setIsDrawing(false);
    lastPointRef.current = null;
  };

  // Stamp library addition
  const addStamp = (type: DraggableStamp["type"]) => {
    const id = `stamp-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    let width = 130;
    let height = 42;
    let label = "Button";

    switch (type) {
      case "button":
        width = 130;
        height = 42;
        label = "Action Button";
        break;
      case "input":
        width = 180;
        height = 40;
        label = "Input Field...";
        break;
      case "card":
        width = 230;
        height = 140;
        label = "Card Container";
        break;
      case "badge":
        width = 90;
        height = 28;
        label = "★ Badge";
        break;
      case "checkbox":
        width = 140;
        height = 32;
        label = "☑ Checkbox";
        break;
      case "toggle":
        width = 130;
        height = 36;
        label = "🔘 Switch";
        break;
      case "dropdown":
        width = 160;
        height = 38;
        label = "▾ Dropdown";
        break;
      case "table":
        width = 240;
        height = 120;
        label = "⊞ Data Table";
        break;
      case "navbar":
        width = 280;
        height = 48;
        label = "☰ Brand Navbar";
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

    const nextStamps = [...stamps, newStamp];
    setStamps(nextStamps);
    setSelectedStampId(newStamp.id);
    setSelectedShapeId(null);
    setSelectedTextId(null);
    setActiveTool("select"); // Auto-shift to select mode
    setHasDrawn(true);
    takeSnapshot(strokes, shapes, nextStamps, textItems);
  };

  // Shape Resize Pointer Down
  const handleShapeResizePointerDown = (
    e: React.PointerEvent,
    shape: CanvasShape,
    handle: ResizeHandleType
  ) => {
    e.stopPropagation();
    setIsResizingShape(true);
    activeResizeHandle.current = handle;
    shapeResizeOrigin.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: shape.x,
      initialY: shape.y,
      initialWidth: shape.width,
      initialHeight: shape.height,
    };
  };

  // Stamp Resize Pointer Down
  const handleStampResizePointerDown = (
    e: React.PointerEvent,
    stamp: DraggableStamp,
    handle: ResizeHandleType
  ) => {
    e.stopPropagation();
    setIsResizingStamp(true);
    activeStampResizeHandle.current = handle;
    stampResizeOrigin.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: stamp.x,
      initialY: stamp.y,
      initialWidth: stamp.width,
      initialHeight: stamp.height,
    };
  };

  const handleContainerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    // 1. Resizing Shape
    if (
      isResizingShape &&
      selectedShapeId &&
      shapeResizeOrigin.current &&
      activeResizeHandle.current
    ) {
      const handle = activeResizeHandle.current;
      const origin = shapeResizeOrigin.current;
      const dx = e.clientX - origin.startX;
      const dy = e.clientY - origin.startY;

      let newX = origin.initialX;
      let newY = origin.initialY;
      let newW = origin.initialWidth;
      let newH = origin.initialHeight;

      if (handle.includes("e")) newW = Math.max(20, origin.initialWidth + dx);
      if (handle.includes("s")) newH = Math.max(20, origin.initialHeight + dy);
      if (handle.includes("w")) {
        const potentialW = origin.initialWidth - dx;
        if (potentialW >= 20) {
          newW = potentialW;
          newX = origin.initialX + dx;
        }
      }
      if (handle.includes("n")) {
        const potentialH = origin.initialHeight - dy;
        if (potentialH >= 20) {
          newH = potentialH;
          newY = origin.initialY + dy;
        }
      }

      setShapes((prev) =>
        prev.map((s) =>
          s.id === selectedShapeId
            ? { ...s, x: newX, y: newY, width: newW, height: newH }
            : s
        )
      );
      return;
    }

    // 2. Dragging Shape
    if (isDraggingShape && selectedShapeId) {
      const containerRect = containerRef.current?.getBoundingClientRect();
      if (!containerRect) return;
      const newX = Math.max(0, e.clientX - containerRect.left - shapeDragOffset.x);
      const newY = Math.max(0, e.clientY - containerRect.top - shapeDragOffset.y);

      setShapes((prev) =>
        prev.map((s) => (s.id === selectedShapeId ? { ...s, x: newX, y: newY } : s))
      );
      return;
    }

    // 3. Resizing Stamp
    if (
      isResizingStamp &&
      selectedStampId &&
      stampResizeOrigin.current &&
      activeStampResizeHandle.current
    ) {
      const handle = activeStampResizeHandle.current;
      const origin = stampResizeOrigin.current;
      const dx = e.clientX - origin.startX;
      const dy = e.clientY - origin.startY;

      let newX = origin.initialX;
      let newY = origin.initialY;
      let newW = origin.initialWidth;
      let newH = origin.initialHeight;

      if (handle.includes("e")) newW = Math.max(40, origin.initialWidth + dx);
      if (handle.includes("s")) newH = Math.max(24, origin.initialHeight + dy);
      if (handle.includes("w")) {
        const potentialW = origin.initialWidth - dx;
        if (potentialW >= 40) {
          newW = potentialW;
          newX = origin.initialX + dx;
        }
      }
      if (handle.includes("n")) {
        const potentialH = origin.initialHeight - dy;
        if (potentialH >= 24) {
          newH = potentialH;
          newY = origin.initialY + dy;
        }
      }

      setStamps((prev) =>
        prev.map((s) =>
          s.id === selectedStampId
            ? { ...s, x: newX, y: newY, width: newW, height: newH }
            : s
        )
      );
      return;
    }

    // 4. Dragging Stamp
    if (isDraggingStamp && selectedStampId) {
      setStamps((prev) =>
        prev.map((s) =>
          s.id === selectedStampId
            ? {
                ...s,
                x: Math.max(0, e.clientX - dragOffset.x),
                y: Math.max(0, e.clientY - dragOffset.y),
              }
            : s
        )
      );
      return;
    }

    // 5. Dragging Text
    if (isDraggingText && selectedTextId) {
      setTextItems((prev) =>
        prev.map((t) =>
          t.id === selectedTextId
            ? {
                ...t,
                x: Math.max(0, e.clientX - textDragOffset.x),
                y: Math.max(0, e.clientY - textDragOffset.y),
              }
            : t
        )
      );
      return;
    }

    // 6. Resizing Text
    if (isResizingText && selectedTextId && textResizeStart.current) {
      const delta =
        e.clientX - textResizeStart.current.startX + (e.clientY - textResizeStart.current.startY);
      const newSize = Math.max(
        12,
        Math.min(96, Math.round(textResizeStart.current.initialFontSize + delta * 0.35))
      );
      setTextItems((prev) =>
        prev.map((t) => (t.id === selectedTextId ? { ...t, fontSize: newSize } : t))
      );
    }
  };

  const handleContainerPointerUp = () => {
    let shouldSnapshot = false;

    if (isResizingShape) {
      setIsResizingShape(false);
      activeResizeHandle.current = null;
      shapeResizeOrigin.current = null;
      shouldSnapshot = true;
    }
    if (isDraggingShape) {
      setIsDraggingShape(false);
      shouldSnapshot = true;
    }
    if (isResizingStamp) {
      setIsResizingStamp(false);
      activeStampResizeHandle.current = null;
      stampResizeOrigin.current = null;
      shouldSnapshot = true;
    }
    if (isDraggingStamp) {
      setIsDraggingStamp(false);
      shouldSnapshot = true;
    }
    if (isDraggingText) {
      setIsDraggingText(false);
      shouldSnapshot = true;
    }
    if (isResizingText) {
      setIsResizingText(false);
      textResizeStart.current = null;
      shouldSnapshot = true;
    }

    if (shouldSnapshot) {
      takeSnapshot();
    }
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
        takeSnapshot(strokes, shapes, stamps, textItems);
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
    setShapes([]);
    setTextItems([]);
    takeSnapshot([], [], [], []);
  };

  // Export crisp composite canvas image including drawn shapes, stamps, and text
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

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(canvas, 0, 0, targetW, targetH);

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.scale(dpr * scale, dpr * scale);

    // Draw interactive shapes onto export
    shapes.forEach((shape) => {
      ctx.beginPath();
      ctx.strokeStyle = shape.color;
      ctx.lineWidth = shape.strokeWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      if (shape.type === "rectangle") {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else {
        const rx = shape.width / 2;
        const ry = shape.height / 2;
        ctx.ellipse(shape.x + rx, shape.y + ry, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

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

  // Structured layout inventory describing drawn wireframe for NIM models
  const serializeWireframeLayout = (): string => {
    const elements: string[] = [];

    shapes.forEach((s, idx) => {
      const isWide = s.width > s.height * 2.2;
      const isTall = s.height > s.width * 1.5;
      const roleGuess =
        s.type === "rectangle"
          ? isWide && s.height < 60
            ? "Button or Input Box"
            : isTall
            ? "Card Container or Sidebar"
            : "Card or Container Panel"
          : "Circular Badge or Avatar";

      elements.push(
        `- ${s.type.toUpperCase()} #${idx + 1}: at (x: ${Math.round(s.x)}, y: ${Math.round(s.y)}), size: ${Math.round(s.width)}x${Math.round(s.height)}px. Inferred role: ${roleGuess}. Color: ${s.color}`
      );
    });

    stamps.forEach((stamp, idx) => {
      elements.push(
        `- COMPONENT STAMP #${idx + 1} (${stamp.type.toUpperCase()}): labeled "${stamp.label}" at (x: ${Math.round(stamp.x)}, y: ${Math.round(stamp.y)}), size: ${Math.round(stamp.width)}x${Math.round(stamp.height)}px`
      );
    });

    textItems.forEach((text, idx) => {
      elements.push(
        `- TEXT ITEM #${idx + 1}: "${text.text}" (font size: ${text.fontSize}px) at (x: ${Math.round(text.x)}, y: ${Math.round(text.y)})`
      );
    });

    if (strokes.length > 0) {
      elements.push(
        `- FREEHAND PEN SKETCHES: ${strokes.length} hand-drawn ink strokes illustrating wireframe borders, layout dividers, or icon sketches.`
      );
    }

    if (elements.length === 0) {
      return "Hand-drawn wireframe component sketch.";
    }

    return `CANVAS WIREFRAME INVENTORY:\n${elements.join("\n")}`;
  };

  const handleCompileClick = () => {
    const dataUrl = exportCompositeCanvas();
    const wireframeDescription = serializeWireframeLayout();
    onCompile(dataUrl, selectedPreset ?? undefined, wireframeDescription);
  };

  // Dynamic compile button state
  const compileStatusText = useMemo(() => {
    if (!isCompiling) return "Compile Component →";
    const isNvidia =
      apiKeyMode === "default_2" ||
      (apiKeyMode === "custom" && compileProvider === "nvidia");
    if (isNvidia) {
      const model = compileModelId ? compileModelId.replace("z-ai/", "") : "NIM";
      return `Compiling with NVIDIA NIM (${model})...`;
    }
    return "Compiling with Gemma 4...";
  }, [isCompiling, apiKeyMode, compileProvider, compileModelId]);

  return (
    <div className="relative flex size-full flex-col overflow-hidden rounded-2xl border-2 border-[#18181b] bg-white shadow-xl">
      {/* Top Toolbox: Generously spaced tool groups */}
      <div className="flex flex-wrap items-center justify-between border-b-2 border-[#18181b] bg-[#eceae1] px-3 sm:px-4 py-2 text-xs gap-2">
        {/* Tool Group 1: Modes (Select, Pen, Rect, Circle, Text, Eraser) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#52525b] font-bold hidden sm:inline mr-1">
            Tools:
          </span>
          <div className="flex items-center gap-1">
            {/* Mode: Select / Pointer */}
            <SketchOptionButton
              active={activeTool === "select"}
              onClick={() => setActiveTool("select")}
              className="px-2 sm:px-2.5 py-1"
              title="Select tool (V or Ctrl+S): click to drag, move, or resize shapes, stamps & text"
            >
              <MousePointer className="size-3.5" />
              <span className="hidden md:inline font-bold">Select</span>
            </SketchOptionButton>

            {/* Mode: Pen */}
            <SketchOptionButton
              active={activeTool === "pen"}
              onClick={() => {
                setActiveTool("pen");
                setSelectedShapeId(null);
                setSelectedStampId(null);
                setSelectedTextId(null);
              }}
              className="px-2 sm:px-2.5 py-1"
              title="Freehand pen (P)"
            >
              <PenTool className="size-3.5" />
              <span className="hidden md:inline">Pen</span>
            </SketchOptionButton>

            {/* Shape: Rectangle */}
            <SketchOptionButton
              active={activeTool === "rectangle"}
              onClick={() => {
                setActiveTool("rectangle");
                setSelectedShapeId(null);
                setSelectedStampId(null);
                setSelectedTextId(null);
              }}
              className="px-2 sm:px-2.5 py-1"
              title="Rectangle shape tool (R): drag to draw, auto-shifts to select"
            >
              <Square className="size-3.5" />
              <span className="hidden md:inline">Rect</span>
            </SketchOptionButton>

            {/* Shape: Circle */}
            <SketchOptionButton
              active={activeTool === "circle"}
              onClick={() => {
                setActiveTool("circle");
                setSelectedShapeId(null);
                setSelectedStampId(null);
                setSelectedTextId(null);
              }}
              className="px-2 sm:px-2.5 py-1"
              title="Circle shape tool (C): drag to draw, auto-shifts to select"
            >
              <Circle className="size-3.5" />
              <span className="hidden md:inline">Circle</span>
            </SketchOptionButton>

            {/* Text Tool */}
            <SketchOptionButton
              active={activeTool === "text"}
              onClick={() => {
                setActiveTool("text");
                setSelectedShapeId(null);
                setSelectedStampId(null);
                setSelectedTextId(null);
              }}
              className="px-2 sm:px-2.5 py-1"
              title="Draggable scalable text tool (T)"
            >
              <Type className="size-3.5" />
              <span className="hidden md:inline">Text</span>
            </SketchOptionButton>

            {/* Eraser */}
            <SketchOptionButton
              active={activeTool === "eraser"}
              onClick={() => {
                setActiveTool("eraser");
                setSelectedShapeId(null);
                setSelectedStampId(null);
                setSelectedTextId(null);
              }}
              className="px-2 sm:px-2.5 py-1"
              title="Eraser tool (E)"
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
                title="Eradicator: touch to delete the single touched stroke"
              >
                <Scissors className="size-3" />
                <span>Eradicator</span>
              </SketchOptionButton>
            </div>
          )}
        </div>

        {/* Tool Group 2: Ink Colors */}
        {activeTool !== "eraser" && activeTool !== "select" && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#52525b] font-bold hidden sm:inline">
              Ink:
            </span>
            <div className="flex items-center gap-2 rounded-xl border border-[#18181b] bg-white px-2 py-1">
              {PEN_COLORS.map((col) => (
                <button
                  key={col.hex}
                  onClick={() => setPenColor(col.hex)}
                  className={`size-4.5 rounded-full transition-transform ${
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

        {/* Tool Group 3: Stroke Widths */}
        {activeTool !== "text" && activeTool !== "select" && (
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

        {/* Tool Group 4: Undo/Redo & Utility Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-[#18181b] bg-white p-1 text-[#52525b]">
            <button
              onClick={undo}
              disabled={history.length <= 1}
              className="rounded-lg p-1.5 hover:bg-[#f5f4ee] hover:text-[#18181b] disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <RotateCcw className="size-3.5" />
            </button>
            <button
              onClick={redo}
              disabled={redoStack.length === 0}
              className="rounded-lg p-1.5 hover:bg-[#f5f4ee] hover:text-[#18181b] disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <RotateCw className="size-3.5" />
            </button>
          </div>

          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border-2 border-[#2724d1] bg-blue-50 px-2.5 py-1.5 font-mono text-xs font-bold text-[#2724d1] hover:bg-blue-100 shadow-xs transition-all active:scale-95"
            title="Open example preset napkin wireframes"
          >
            <Sparkles className="size-3.5 text-[#2724d1]" />
            <span className="hidden sm:inline">Try These</span>
          </button>

          <label
            className="flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#18181b] bg-white px-2.5 py-1.5 text-xs text-[#18181b] hover:bg-[#f5f4ee] transition-colors"
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
      <div className="flex items-center gap-2 border-b border-[#18181b] bg-[#faf9f5] px-3 sm:px-4 py-1.5 text-xs overflow-x-auto">
        <span className="font-mono text-[10px] uppercase tracking-wider text-[#52525b] font-bold whitespace-nowrap mr-1">
          Stamps (Double-Click To Rename, Select To Resize):
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
        onPointerMove={handleContainerPointerMove}
        onPointerUp={handleContainerPointerUp}
        className="relative flex-1 bg-white select-none overflow-hidden bg-sketchbook-dots"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`touch-none-canvas size-full block ${
            isCompiling
              ? "cursor-not-allowed"
              : activeTool === "select"
              ? "cursor-default"
              : activeTool === "text"
              ? "cursor-text"
              : activeTool === "eraser"
              ? "cursor-crosshair"
              : "cursor-crosshair"
          }`}
        />

        {/* Live creation preview for rectangle/circle */}
        {shapePreview && (
          <div
            style={{
              left: `${shapePreview.x}px`,
              top: `${shapePreview.y}px`,
              width: `${shapePreview.width}px`,
              height: `${shapePreview.height}px`,
              borderColor: shapePreview.color,
              borderWidth: `${shapePreview.strokeWidth}px`,
            }}
            className={`pointer-events-none absolute border border-dashed ${
              shapePreview.type === "circle" ? "rounded-full" : "rounded-sm"
            }`}
          />
        )}

        {/* Interactive Resizable & Draggable Shapes Layer */}
        {shapes.map((shape) => {
          const isSelected = selectedShapeId === shape.id;
          return (
            <div
              key={shape.id}
              onPointerDown={(e) => {
                if (activeTool !== "select") return; // Only allow selecting/dragging in select mode
                e.stopPropagation();
                setSelectedShapeId(shape.id);
                setSelectedStampId(null);
                setSelectedTextId(null);
                setIsDraggingShape(true);
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) {
                  setShapeDragOffset({
                    x: e.clientX - rect.left - shape.x,
                    y: e.clientY - rect.top - shape.y,
                  });
                }
              }}
              style={{
                left: `${shape.x}px`,
                top: `${shape.y}px`,
                width: `${shape.width}px`,
                height: `${shape.height}px`,
                borderColor: shape.color,
                borderWidth: `${shape.strokeWidth}px`,
              }}
              className={`absolute select-none transition-shadow ${
                shape.type === "circle" ? "rounded-full" : "rounded-md"
              } ${
                activeTool === "select"
                  ? "pointer-events-auto cursor-move"
                  : "pointer-events-none"
              } ${
                isSelected
                  ? "ring-2 ring-[#2724d1] ring-offset-2 ring-offset-white shadow-lg"
                  : activeTool === "select"
                  ? "hover:ring-1 hover:ring-[#2724d1]/50"
                  : ""
              }`}
            >
              {/* Selection Border & 8 Resize Handles */}
              {isSelected && activeTool === "select" && (
                <>
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextShapes = shapes.filter((s) => s.id !== shape.id);
                      setShapes(nextShapes);
                      setSelectedShapeId(null);
                      takeSnapshot(strokes, nextShapes, stamps, textItems);
                    }}
                    className="absolute -top-3 -right-3 flex size-5 items-center justify-center rounded-full bg-[#d12724] text-[10px] text-white hover:bg-red-700 shadow-sm pointer-events-auto"
                    title="Delete shape"
                  >
                    ✕
                  </button>

                  {/* 8 Resize Handles: NW, N, NE, E, SE, S, SW, W */}
                  <div
                    onPointerDown={(e) => handleShapeResizePointerDown(e, shape, "nw")}
                    className="absolute -top-1.5 -left-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-nwse-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleShapeResizePointerDown(e, shape, "n")}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rounded-full bg-[#2724d1] border border-white cursor-ns-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleShapeResizePointerDown(e, shape, "ne")}
                    className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-nesw-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleShapeResizePointerDown(e, shape, "e")}
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-ew-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleShapeResizePointerDown(e, shape, "se")}
                    className="absolute -bottom-1.5 -right-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-nwse-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleShapeResizePointerDown(e, shape, "s")}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-3 rounded-full bg-[#2724d1] border border-white cursor-ns-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleShapeResizePointerDown(e, shape, "sw")}
                    className="absolute -bottom-1.5 -left-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-nesw-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleShapeResizePointerDown(e, shape, "w")}
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-ew-resize shadow-xs pointer-events-auto"
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Interactive Draggable & Resizable Stamps Layer */}
        {stamps.map((stamp) => {
          const isSelected = selectedStampId === stamp.id;
          return (
            <div
              key={stamp.id}
              onPointerDown={(e) => {
                if (activeTool !== "select" || editingStampId === stamp.id) return;
                e.stopPropagation();
                setSelectedStampId(stamp.id);
                setSelectedShapeId(null);
                setSelectedTextId(null);
                setIsDraggingStamp(true);
                setDragOffset({ x: e.clientX - stamp.x, y: e.clientY - stamp.y });
              }}
              onDoubleClick={(e) => {
                if (activeTool !== "select") return;
                e.stopPropagation();
                setEditingStampId(stamp.id);
              }}
              style={{
                left: `${stamp.x}px`,
                top: `${stamp.y}px`,
                width: `${stamp.width}px`,
                height: `${stamp.height}px`,
              }}
              className={`absolute flex items-center justify-center rounded-xl border-2 border-dashed border-[#2724d1] bg-blue-50/85 font-mono text-xs text-[#18181b] select-none transition-shadow ${
                activeTool === "select"
                  ? "pointer-events-auto cursor-move shadow-md"
                  : "pointer-events-none"
              } ${
                isSelected && activeTool === "select"
                  ? "ring-2 ring-[#2724d1] shadow-lg"
                  : ""
              }`}
            >
              {editingStampId === stamp.id ? (
                <input
                  type="text"
                  autoFocus
                  defaultValue={stamp.label}
                  onBlur={(e) => {
                    const val = e.target.value.trim() || stamp.label;
                    const nextStamps = stamps.map((s) =>
                      s.id === stamp.id ? { ...s, label: val } : s
                    );
                    setStamps(nextStamps);
                    setEditingStampId(null);
                    takeSnapshot(strokes, shapes, nextStamps, textItems);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-[90%] bg-white px-1.5 py-0.5 rounded border border-[#2724d1] text-xs font-mono font-bold text-[#18181b] focus:outline-none pointer-events-auto"
                />
              ) : (
                <span className="font-bold px-2 truncate pointer-events-none">{stamp.label}</span>
              )}

              {/* Stamp Controls when selected in select mode */}
              {isSelected && activeTool === "select" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextStamps = stamps.filter((s) => s.id !== stamp.id);
                      setStamps(nextStamps);
                      setSelectedStampId(null);
                      takeSnapshot(strokes, shapes, nextStamps, textItems);
                    }}
                    className="absolute -top-2.5 -right-2.5 flex size-5 items-center justify-center rounded-full bg-[#d12724] text-xs text-white hover:bg-red-700 shadow-xs pointer-events-auto"
                    title="Remove stamp"
                  >
                    ✕
                  </button>

                  {/* Stamp 8 Resize Handles */}
                  <div
                    onPointerDown={(e) => handleStampResizePointerDown(e, stamp, "nw")}
                    className="absolute -top-1.5 -left-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-nwse-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleStampResizePointerDown(e, stamp, "n")}
                    className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-3 rounded-full bg-[#2724d1] border border-white cursor-ns-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleStampResizePointerDown(e, stamp, "ne")}
                    className="absolute -top-1.5 -right-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-nesw-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleStampResizePointerDown(e, stamp, "e")}
                    className="absolute top-1/2 -translate-y-1/2 -right-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-ew-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleStampResizePointerDown(e, stamp, "se")}
                    className="absolute -bottom-1.5 -right-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-nwse-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleStampResizePointerDown(e, stamp, "s")}
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 size-3 rounded-full bg-[#2724d1] border border-white cursor-ns-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleStampResizePointerDown(e, stamp, "sw")}
                    className="absolute -bottom-1.5 -left-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-nesw-resize shadow-xs pointer-events-auto"
                  />
                  <div
                    onPointerDown={(e) => handleStampResizePointerDown(e, stamp, "w")}
                    className="absolute top-1/2 -translate-y-1/2 -left-1.5 size-3 rounded-full bg-[#2724d1] border border-white cursor-ew-resize shadow-xs pointer-events-auto"
                  />
                </>
              )}
            </div>
          );
        })}

        {/* Scalable Draggable Canvas Text Items */}
        {textItems.map((item) => {
          const isSelected = selectedTextId === item.id;
          return (
            <div
              key={item.id}
              onPointerDown={(e) => {
                if (activeTool !== "select" || editingTextId === item.id) return;
                e.stopPropagation();
                setSelectedTextId(item.id);
                setSelectedShapeId(null);
                setSelectedStampId(null);
                setIsDraggingText(true);
                setTextDragOffset({ x: e.clientX - item.x, y: e.clientY - item.y });
              }}
              onDoubleClick={(e) => {
                if (activeTool !== "select") return;
                e.stopPropagation();
                setEditingTextId(item.id);
              }}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
              }}
              className={`absolute flex items-center p-1.5 rounded-lg font-pen select-none group border border-transparent ${
                activeTool === "select"
                  ? "pointer-events-auto cursor-move"
                  : "pointer-events-none"
              } ${
                isSelected && activeTool === "select"
                  ? "border-dashed border-[#2724d1] bg-blue-50/40"
                  : activeTool === "select"
                  ? "hover:border-dashed hover:border-gray-400"
                  : ""
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
                    const nextTexts = textItems.map((t) =>
                      t.id === item.id ? { ...t, text: val } : t
                    );
                    setTextItems(nextTexts);
                    setEditingTextId(null);
                    takeSnapshot(strokes, shapes, stamps, nextTexts);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur();
                    }
                  }}
                  className="bg-white px-2 py-0.5 rounded border border-[#2724d1] font-bold focus:outline-none pointer-events-auto"
                />
              ) : (
                <span
                  style={{ fontSize: `${item.fontSize}px`, color: item.color }}
                  className="font-bold whitespace-nowrap pointer-events-none"
                >
                  {item.text}
                </span>
              )}

              {/* Diagonal Resize Handle */}
              {isSelected && activeTool === "select" && (
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
                  className="absolute -right-2 -bottom-2 flex size-4 items-center justify-center rounded-full bg-[#2724d1] text-white text-[9px] cursor-nwse-resize shadow-xs pointer-events-auto"
                  title="Drag diagonally to scale font size"
                >
                  ↘
                </div>
              )}

              {/* Remove Text Item Button */}
              {isSelected && activeTool === "select" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const nextTexts = textItems.filter((t) => t.id !== item.id);
                    setTextItems(nextTexts);
                    setSelectedTextId(null);
                    takeSnapshot(strokes, shapes, stamps, nextTexts);
                  }}
                  className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-[#d12724] text-white text-[9px] hover:bg-red-700 shadow-xs pointer-events-auto"
                  title="Remove text"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}

        {/* Empty Canvas Guidance */}
        {!hasDrawn && shapes.length === 0 && stamps.length === 0 && textItems.length === 0 && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="flex size-14 items-center justify-center rounded-2xl border-2 border-[#2724d1] bg-blue-50 text-[#2724d1] mb-3 shadow-xs">
              <PenTool className="size-6 stroke-[2.2]" />
            </div>
            <h4 className="text-base font-bold text-[#18181b] font-mono">
              Digital Napkin Sketchboard
            </h4>
            <p className="mt-1 text-xs text-[#52525b] max-w-sm leading-relaxed">
              Draw wireframes with pen, shapes, or stamps. Switch to Select mode (V or Ctrl+S) to move and resize anything!
            </p>
          </div>
        )}

        {/* Canvas Locked Overlay while Compiling */}
        {isCompiling && (
          <div className="absolute inset-0 z-40 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center cursor-not-allowed select-none">
            <div className="flex items-center gap-2.5 rounded-2xl border-2 border-[#18181b] bg-[#eceae1] px-5 py-3 font-mono text-xs font-bold text-[#18181b] shadow-xl">
              <svg
                className="size-4 animate-spin text-[#2724d1]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
              <span>{compileStatusText} Canvas drawing is temporarily locked.</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Floating Compile Action Bar */}
      <div className="flex items-center justify-between border-t-2 border-[#18181b] bg-[#eceae1] px-3 sm:px-4 py-2 sm:py-2.5">
        <div className="flex items-center gap-2">
          {selectedPreset ? (
            <span className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-mono font-bold text-[#2724d1] border border-[#2724d1]">
              <Sparkles className="size-3.5 text-[#2724d1]" />
              Active: {selectedPreset.title}
            </span>
          ) : (
            <span className="text-xs text-[#52525b] font-mono">
              {hasDrawn || shapes.length > 0 || stamps.length > 0 || textItems.length > 0
                ? "Ready to compile"
                : "Sketch on canvas"}
            </span>
          )}
        </div>

        {/* Compile Button with fresh pen re-sketch on hover */}
        <SketchButton
          variant="primary"
          onClick={handleCompileClick}
          disabled={
            isCompiling ||
            (!hasDrawn && shapes.length === 0 && stamps.length === 0 && textItems.length === 0)
          }
          className="text-xs font-bold py-2 px-5 sm:px-6"
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
              <span>{compileStatusText}</span>
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
