# ✏️ Sketch2Kernel

> **Transform hand-drawn napkin wireframes into production-ready Tailwind CSS components in seconds.**

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3-blue?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Google Gemma](https://img.shields.io/badge/Google_Gemma_4-26B%20%2F%2031B-4285F4?style=flat&logo=google)](https://deepmind.google/technologies/gemma/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA_NIM-GLM--5.3%20%7C%20GPT--OSS-76B900?style=flat&logo=nvidia)](https://build.nvidia.com)
[![Rough.js](https://img.shields.io/badge/Aesthetic-Rough.js%20%7C%20Drawably-orange?style=flat)](https://roughjs.com)

---

## 💡 The Vision & Philosophy

Every great product idea starts the exact same way: **sketched on a coffee shop napkin, a scrap of paper, or a whiteboard.** 

**Sketch2Kernel** bridges the gap between chaotic, intuitive hand-drawn napkin sketches and clean, semantic, production-grade Tailwind CSS components.

Instead of presenting another sterile corporate SaaS interface, Sketch2Kernel is designed entirely as an authentic **interactive digital sketchbook**:
- **Drawn Component Aesthetic**: Hand-sketched buttons, panels, tabs, and borders powered by `drawably`, `roughjs`, and `wired-elements`.
- **Lively Ink Effects**: Buttons and controls that physically re-sketch their borders on hover.
- **Paper Textures**: Authentic notebook paper grid and dot matrices that feel like you're creating inside an architect's journal.

---

## ⚡ Key Capabilities

### 🎨 1. Digital Napkin Sketchboard
- **Freehand Pen**: Smooth hand-drawn strokes with multiple ballpoint and graphite ink colors and stroke sizes.
- **Interactive Resizable Shapes**: Click & drag to create Rectangles and Circles with **8-point precision resize handles** (NW, N, NE, E, SE, S, SW, W) and border/body movement.
- **Pre-Made UI Component Stamps**: Stamp editable Buttons, Input fields, Card containers, Badges, Checkboxes, Toggle switches, Dropdowns, Tables, and Navbars onto the board.
  - *Double-click to rename any label in place.*
  - *Select to scale and resize stamps with 8-point handles.*
- **Scalable Draggable Text**: Place text labels and titles, and drag diagonally to smoothly scale font sizes.
- **Precision Eradicator Mode**: Geometrical point-to-line-segment collision targeting that removes **only the single touched stroke** without deleting crossing or connected strokes (e.g., erasing a vertical line in a plus sign leaves the horizontal line intact).
- **Comprehensive Multi-Layer Undo/Redo**: Deep snapshot state history tracking pen strokes, shapes, stamps, text items, and canvas pixels.
- **Keyboard Shortcuts**:
  - `Ctrl+Z` / `Cmd+Z`: Undo
  - `Ctrl+Y` / `Cmd+Y` / `Ctrl+Shift+Z`: Redo
  - `Ctrl+S` / `V`: Switch to Select Mode (prevents browser save dialog)
  - `P`: Pen Tool
  - `R`: Rectangle Tool
  - `C`: Circle Tool
  - `T`: Scalable Text Tool
  - `E`: Eraser Tool
  - `Delete` / `Backspace`: Remove selected shape, stamp, or text
- **Paper Photo Upload**: Upload photographs or scans of actual paper napkins and sketches directly onto the canvas.
- **Trial Wireframe Presets**: Built-in library of curated napkin sketches (Hero Sections, Pricing Tables, Auth Cards, Dashboards, and Data Grids).

---

### 🤖 2. Dual AI Compilation Engines

Sketch2Kernel features two specialized compilation engines:

#### Engine A: Google Gemma 4 (Multimodal Vision)
- **Direct Visual Synthesis**: Processes raw base64 canvas imagery directly with `gemma-4-26b-a4b-it`.
- **Dynamic Redundancy**: Seamlessly falls back to `gemma-4-31b-it` if primary model limits are reached, ensuring non-stop uptime.
- **Pixel-Accurate Mapping**: Recognizes spatial relationships, groupings, and handwritten notes.

#### Engine B: NVIDIA NIM (`z-ai/glm-5.3` & `openai/gpt-oss-20b`)
- **Sub-2-Second Accelerated Generation**: Zero-thinking enforcement (`reasoning_effort: "low"`) prevents reasoning token burnout and delivers lightning-fast component generation.
- **Canvas Semantic Layout Serializer**: Automatically serializes canvas shapes, component stamps, text labels, dimensions, and layout hierarchy into a detailed inventory. Non-vision models receive exact spatial context, preventing hallucinations.
- **Strict 39 RPM Sliding Window Rate Limiter**: Hardware-level local rate limiter that queues and holds requests before hitting upstream NVIDIA endpoints, completely preventing `429 Too Many Requests` penalties.

---

### 🛡️ 3. Resilient Multi-Format Output Extractor
Language models output code in varied formats depending on temperature and prompt dynamics. Sketch2Kernel includes a multi-stage parser in `lib/json-extractor.ts`:
- **Pure JSON & Fenced Blocks**: Standard `{ componentName, html, props }` parsing.
- **Syntax Repair**: Automatically heals unescaped newlines, tabs, and unescaped double quotes inside HTML attributes.
- **Markdown HTML Blocks**: Recovers pure HTML from ```` ```html ```` code fences.
- **Git/Diff Patches**: Extracts and reconstructs component markup from ```` ```diff ```` and `+` patch lines.
- **Raw HTML Extraction**: Recovers outer HTML elements from conversational model commentary.
- **Automatic Prop Synthesis**: Intelligently derives interactive component props from template tokens (`{{propName}}`) or DOM elements when props are omitted.

---

### 🧪 4. Live Interactive Sandbox Runner
- **Tailwind CSS Sandbox**: Renders compiled components inside an isolated iframe powered by Tailwind CSS CDN.
- **Real-Time Interconnected Props Table**:
  - Automatically displays customizable component properties (labels, titles, button text, style variants, colors).
  - **Live Binding**: Editing any prop value in the table immediately re-interpolates the HTML and updates the live preview in real time!
- **Viewport Switcher**: Instantly toggle between **Desktop (100%)** and **Mobile (375px)** previews.
- **One-Click Code Viewer**: View clean, formatted Tailwind HTML markup and copy it to your clipboard with celebratory particle effects.
- **Mobile Side Drawer**: On smartphones and small tablets, the sandbox cleanly slides out as a responsive drawer upon compilation.

---

## 🏗️ Architecture & Project Structure

```
sketch-to-kernel/
├── app/
│   ├── api/
│   │   └── compile/
│   │       └── route.ts          # Unified AI compilation endpoint (Gemini & NIM)
│   ├── playground/
│   │   └── page.tsx              # Edge-to-edge workbench (Canvas & Sandbox)
│   ├── globals.css               # Hand-drawn theme styles & fonts
│   ├── layout.tsx                # App root layout
│   └── page.tsx                  # Landing page with seamless blob transition
├── components/
│   ├── canvas-panel.tsx          # Sketchboard: shapes, stamps, pen, eraser, shortcuts
│   ├── canvas-presets.ts         # Curated napkin wireframe presets
│   ├── code-viewer.tsx           # Clean HTML/Tailwind viewer
│   ├── navbar.tsx                # Hand-drawn navigation and API key modal
│   ├── props-table.tsx           # Interactive, live-bound prop editor
│   ├── sandbox-panel.tsx         # Live component preview and code runner
│   └── sketch-ui.tsx             # RoughJS & Drawably hand-sketched UI components
└── lib/
    ├── json-extractor.ts         # Resilient multi-format HTML/JSON extractor
    ├── nvidia-nim.ts             # NVIDIA NIM client with GLM/GPT support
    ├── nvidia-rate-limiter.ts    # 39 RPM sliding window rate limiter
    ├── sanitizer.ts              # XSS and HTML safety sanitizer
    ├── schemas.ts                # Zod request/response validation schemas
    └── types.ts                  # Shared TypeScript interfaces
```

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router, Turbopack)](https://nextjs.org)
- **Library**: [React 19](https://react.dev)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com)
- **Hand-Drawn Engine**: [Drawably](https://github.com/danielwh2/drawably), [RoughJS](https://roughjs.com), [Wired Elements](https://wiredjs.com)
- **AI Models**:
  - [Google DeepMind Gemma 4](https://deepmind.google/technologies/gemma/) via `@google/genai`
  - [NVIDIA NIM](https://build.nvidia.com) (`z-ai/glm-5.3`, `openai/gpt-oss-20b`)
- **Validation**: [Zod](https://zod.dev)
- **Icons & Polish**: [Lucide React](https://lucide.dev), [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)