# Sketch2Kernel

> Transform hand-drawn napkin wireframes into production-ready Tailwind CSS components in seconds.

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?style=flat&logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.3-blue?style=flat&logo=react)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.3-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Google Gemma](https://img.shields.io/badge/Google_Gemma_4-26B%20%2F%2031B-4285F4?style=flat&logo=google)](https://deepmind.google/technologies/gemma/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA_NIM-GLM--5.3%20%7C%20LLaMA--3.1--70B-76B900?style=flat&logo=nvidia)](https://build.nvidia.com)
[![Rough.js](https://img.shields.io/badge/Aesthetic-Rough.js-orange?style=flat)](https://roughjs.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Demonstration

<!-- DROP YOUR OVERVIEW GIF HERE: assets/demo-overview.gif -->
![Sketch2Kernel Overview](assets/demo-overview.gif)

---

## Overview and Philosophy

Every product idea starts the same way: sketched on a coffee shop napkin, a scrap of paper, or a whiteboard.

Sketch2Kernel bridges the gap between chaotic, intuitive hand-drawn napkin sketches and clean, semantic, production-grade Tailwind CSS components.

Instead of presenting another generic corporate interface, Sketch2Kernel is designed entirely as an authentic interactive digital sketchbook:
- **Hand-Drawn Vector Aesthetic**: Vector buttons, panels, tabs, and borders rendered dynamically with Rough.js.
- **Dynamic Pen Strokes**: Interactive controls and buttons that re-sketch fresh pen strokes on user interaction.
- **Notebook Paper Textures**: Authentic notebook paper grids and dot matrices built for tactile wireframing.
- **60fps Fluid Performance**: Hardware-accelerated drawing pipeline without input stutter or browser lag.

---

## Interactive Features

### 1. Digital Napkin Sketchboard

<!-- DROP YOUR CANVAS GIF HERE: assets/demo-canvas.gif -->
![Interactive Sketchboard](assets/demo-canvas.gif)

- **Freehand Pen**: Continuous 60fps solid strokes with multiple ink colors (Ballpoint Blue, Carbon Black, Crimson Red, Forest Green) and variable stroke sizes.
- **Interactive Resizable Shapes**: Click and drag to create Rectangles and Circles with 8-point precision resize handles (NW, N, NE, E, SE, S, SW, W).
- **Pre-Made UI Component Stamps**: Stamp editable Buttons, Input fields, Card containers, Badges, Checkboxes, Toggle switches, Dropdowns, Tables, and Navbars.
  - Double-click to rename any label in place.
  - Select to scale and reposition stamps with 8-point handles.
- **Scalable Draggable Text**: Place text labels and titles, and drag diagonally to smoothly scale font sizes.
- **Precision Eradicator Mode**: Geometrical point-to-line-segment collision targeting that removes only the single touched stroke without deleting crossing or connected lines.
- **Comprehensive Multi-Layer History**: Deep snapshot state history tracking pen strokes, shapes, stamps, text items, and canvas pixels.
- **Keyboard Shortcuts**:
  - `Ctrl+Z` / `Cmd+Z`: Undo
  - `Ctrl+Y` / `Cmd+Y` / `Ctrl+Shift+Z`: Redo
  - `Ctrl+S` / `V`: Switch to Select Mode (suppresses native browser save dialog)
  - `P`: Pen Tool
  - `R`: Rectangle Tool
  - `C`: Circle Tool
  - `T`: Scalable Text Tool
  - `E`: Eraser Tool
  - `Delete` / `Backspace`: Remove selected shape, stamp, or text item
- **Paper Photo Upload**: Upload photographs or scans of actual paper napkins and sketches directly onto the canvas.
- **Curated Wireframe Presets**: Built-in library of napkin sketches (Hero Section, Pricing Table, Auth Card, Dashboard, and Data Grid).

---

### 2. Multi-Model AI Compilation Engines

<!-- DROP YOUR COMPILATION GIF HERE: assets/demo-compilation.gif -->
![Multi-Engine AI Compilation](assets/demo-compilation.gif)

Sketch2Kernel provides three independent compilation engines with dedicated credential management:

#### Engine 1: Google Gemini (Native Hacktoberfest Track)
- **Direct Visual Synthesis**: Processes raw base64 canvas imagery directly with `gemma-4-31b-it`.
- **Dynamic Redundancy**: Automatically falls back to `gemma-4-26b-a4b-it` if primary quota or limits are reached, ensuring continuous availability.
- **Sliding-Window Rate Limiter**: 29 Requests Per Minute (RPM) client-side sliding window prevents API exhaustion and rate limit errors.

#### Engine 2: NVIDIA NIM (High-Throughput Acceleration)
- **Accelerated Inference**: Supports enterprise-grade endpoints for `z-ai/glm-5.3` and `meta/llama-3.1-70b-instruct`.
- **Reasoning Controls**: Configurable thinking parameter (`enable_thinking: false`) for models that support explicit reasoning toggles.
- **Canvas Semantic Layout Serializer**: Automatically serializes canvas shapes, component stamps, text labels, dimensions, and layout hierarchy into an inventory to ensure pixel-accurate spatial representation.
- **Sliding-Window Rate Limiter**: 39 Requests Per Minute (RPM) hardware-level sliding window rate limiter prevents 429 penalties.

#### Engine 3: Custom OpenAI-Compatible Endpoints
- **Universal Provider Support**: Connect any local or remote OpenAI-compatible endpoint (Ollama, vLLM, OpenRouter, Groq, Together).
- **Custom Configuration**: Specify custom endpoint URL, model identifier, and private API key.
- **Clean Request Payloads**: Adheres strictly to standard OpenAI chat completion schemas without non-standard extra parameters.

---

### 3. Live Interactive Sandbox Runner

<!-- DROP YOUR SANDBOX GIF HERE: assets/demo-sandbox.gif -->
![Live Sandboxed Tailwind & Props](assets/demo-sandbox.gif)

- **Isolated Tailwind Sandbox**: Renders compiled components inside an isolated iframe powered by the official Tailwind Play CDN.
- **Real-Time Two-Way Props Table**:
  - Automatically identifies customizable component properties (labels, titles, button text, style variants, colors).
  - Editing any prop value in the table immediately re-renders the live component in real time.
- **Viewport Switcher**: Instantly toggle between Desktop (100%), Tablet, and Mobile (375px) responsive previews.
- **One-Click Code Export**: View clean, formatted Tailwind HTML or JSX markup and copy it to your clipboard with celebratory particle effects.
- **Security & Sanitization**: Strict HTML sanitization via sanitize-html and DOMPurify strips malicious scripts, event handlers, and iframe injection attempts.
- **Responsive Drawer**: On mobile devices and small screens, the sandbox slides out cleanly as a drawer upon compilation.

---

## Project Structure

```
sketch-to-kernel/
├── app/
│   ├── api/
│   │   └── compile/
│   │       └── route.ts              # Unified AI compilation endpoint
│   ├── playground/
│   │   └── page.tsx                  # Full-screen workbench (Canvas & Sandbox)
│   ├── globals.css                   # Sketchbook theme, fonts, 60fps GPU acceleration
│   ├── layout.tsx                    # Root layout and metadata
│   └── page.tsx                      # Landing page, provider showcase, and demo gallery
├── assets/                           # Demo GIFs and screenshots for README
│   ├── demo-overview.gif
│   ├── demo-canvas.gif
│   ├── demo-compilation.gif
│   └── demo-sandbox.gif
├── components/
│   ├── canvas-panel.tsx              # Digital canvas: shapes, stamps, pen, eraser, shortcuts
│   ├── canvas-presets.ts             # Built-in napkin wireframe presets
│   ├── code-viewer.tsx               # Clean HTML and Tailwind code viewer
│   ├── navbar.tsx                    # Hand-drawn navigation and multi-provider settings
│   ├── props-table.tsx               # Real-time two-way prop synchronization table
│   ├── sandbox-panel.tsx             # Live component preview and isolated runner
│   └── sketch-ui.tsx                 # Rough.js vector UI components and cards
├── lib/
│   ├── custom-endpoint.ts            # Custom OpenAI-compatible endpoint client
│   ├── gemini-rate-limiter.ts        # 29 RPM sliding-window rate limiter for Gemini
│   ├── json-extractor.ts             # Resilient multi-format HTML/JSON extractor
│   ├── nvidia-nim.ts                 # NVIDIA NIM inference client
│   ├── nvidia-rate-limiter.ts        # 39 RPM sliding-window rate limiter for NVIDIA
│   ├── sanitizer.ts                  # XSS and HTML safety sanitizer
│   ├── schemas.ts                    # Zod validation schemas
│   ├── types.ts                      # Shared TypeScript definitions
│   └── utils.ts                      # Local storage and helper utilities
└── tests/
    ├── api-helpers.test.ts           # Route handler and fallback tests
    ├── lib.test.ts                   # Serialization and parser tests
    └── sanitizer.test.ts             # XSS prevention and sanitization tests
```

---

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Pierce05/sketch-to-kernel.git
   cd sketch-to-kernel
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:
   ```env
   # Google Gemini API Keys
   GEMINI_API_KEY_1=your_gemini_api_key_here
   GEMINI_API_KEY_2=optional_backup_gemini_api_key

   # NVIDIA NIM API Keys
   NVIDIA_API_KEY_1=your_nvidia_nim_api_key_here
   NVIDIA_API_KEY_2=optional_backup_nvidia_api_key

   # Custom Endpoint (Optional Server Default)
   CUSTOM_ENDPOINT_URL=https://api.openai.com/v1/chat/completions
   CUSTOM_ENDPOINT_KEY=optional_custom_key
   CUSTOM_ENDPOINT_MODEL=gpt-4o
   ```
   *Note: Users can also input their own private API keys directly in the web UI without configuring environment variables.*

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. Run the test suite:
   ```bash
   npm test
   ```

6. Build for production:
   ```bash
   npm run build
   ```

---

## Technical Specifications

| Component | Implementation Detail |
|---|---|
| Frontend Framework | Next.js 16 (App Router, Turbopack) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 |
| Hand-Drawn Engine | Rough.js vector SVG rendering |
| AI Vision Model | Google Gemma 4 31B with Gemma 4 26B fallback |
| AI NIM Models | z-ai/glm-5.3, meta/llama-3.1-70b-instruct |
| Rate Limiting | 29 RPM (Gemini) / 39 RPM (NVIDIA NIM) sliding window |
| Validation | Zod schema validation |
| Security | DOMPurify, sanitize-html, Content Security Policy |
| Test Coverage | Vitest (45 automated test cases) |

---

## License

This project is open source and available under the [MIT License](LICENSE).