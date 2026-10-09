---
name: sketch-compiler
description: Compiles hand-drawn UI wireframes and whiteboard sketches into responsive Tailwind CSS components with customizable prop variables.
license: MIT
compatibility: Requires Node.js 18+ and access to Gemini API (Gemma 4).
metadata:
  version: "1.0.0"
  track: "Hacktoberfest 2026 - Gemma 4"
---

# Sketch Compiler Skill

Converts whiteboard sketches, wireframe images, and napkin mockups into clean, responsive Tailwind CSS components using Gemma 4 multimodal inference.

## Architecture

1. **Multimodal Analysis**: Reads the input wireframe image (PNG, JPEG, WebP) and recognizes layout structure, headings, buttons, forms, and interactive components.
2. **Tailwind Synthesis**: Translates the wireframe geometry into semantic HTML with modern Tailwind CSS utility classes.
3. **Prop Discovery**: Detects customizable content slots and variable parameters (e.g. title, variant, badges, links).
4. **Sanitization**: Strips scripts, inline event handlers, and unsafe URLs to produce sandbox-safe HTML.

## Usage

### Run via Agent Execution

```bash
node skills/sketch-compiler/scripts/compile.js --image <path-to-image>
```

### Options

- `--image <path>` (Required): Path to local wireframe image file.
- `--output <path>` (Optional): Path to write the compiled HTML file.
- `--model <name>` (Optional): Gemma model identifier (defaults to `gemma-4-31b-it`).
- `--api-key <key>` (Optional): Gemini API key override (or reads from `GEMINI_KEY_1` / `GEMINI_API_KEY`).
