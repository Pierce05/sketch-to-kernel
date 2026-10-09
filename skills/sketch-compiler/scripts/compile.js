#!/usr/bin/env node

/**
 * Standalone CLI script for the Sketch Compiler Agent Skill.
 * Usage: node skills/sketch-compiler/scripts/compile.js --image <path-to-image>
 */

const fs = require("fs");
const path = require("path");

// Parse CLI flags
const args = process.argv.slice(2);
let imagePath = null;
let outputPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--image" && args[i + 1]) {
    imagePath = args[i + 1];
    i++;
  } else if (args[i] === "--output" && args[i + 1]) {
    outputPath = args[i + 1];
    i++;
  }
}

if (!imagePath) {
  console.error("Usage: node skills/sketch-compiler/scripts/compile.js --image <path-to-image> [--output <path>]");
  process.exit(1);
}

const resolvedImagePath = path.resolve(process.cwd(), imagePath);
if (!fs.existsSync(resolvedImagePath)) {
  console.error(`Error: Image file not found at ${resolvedImagePath}`);
  process.exit(1);
}

// Read and convert to base64 data URL
const fileBuffer = fs.readFileSync(resolvedImagePath);
const ext = path.extname(resolvedImagePath).toLowerCase().replace(".", "");
const mimeType = ext === "jpg" || ext === "jpeg" ? "image/jpeg" : ext === "webp" ? "image/webp" : "image/png";
const base64Data = fileBuffer.toString("base64");
const dataUrl = `data:${mimeType};base64,${base64Data}`;

console.log(`[SketchCompiler] Loaded ${resolvedImagePath} (${fileBuffer.length} bytes, ${mimeType})`);

async function compile() {
  const { GoogleGenAI } = require("@google/genai");

  let apiKey = process.env.GEMINI_KEY_1 || process.env.GEMINI_KEY_2 || process.env.GEMINI_API_KEY;

  // Try to load from .env.local if not in process.env
  if (!apiKey && fs.existsSync(".env.local")) {
    const envContent = fs.readFileSync(".env.local", "utf8");
    const m = envContent.match(/GEMINI_KEY_1=(.+)/);
    if (m) apiKey = m[1].trim();
  }

  if (!apiKey) {
    console.error("Error: No Gemini API key found. Set GEMINI_KEY_1 in environment or .env.local");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelName = process.env.GEMMA_MODEL || "gemma-4-31b-it";

  console.log(`[SketchCompiler] Invoking Gemma 4 model: ${modelName}...`);

  const promptText = `You are an expert Tailwind CSS frontend architect.
Convert the provided hand-drawn UI wireframe into a modern, clean, responsive HTML component using Tailwind CSS utility classes.
DO NOT wrap the output in markdown code blocks. Output ONLY raw, parseable JSON conforming to:
{
  "componentName": "string",
  "html": "string containing pure HTML with Tailwind classes",
  "props": [
    { "name": "string", "type": "string", "default": "string", "description": "string" }
  ]
}`;

  const response = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: "user",
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType,
              data: base64Data,
            },
          },
        ],
      },
    ],
  });

  const responseText = response.text || "";
  let cleanJson = responseText.trim();
  if (cleanJson.startsWith("```json")) cleanJson = cleanJson.slice(7);
  else if (cleanJson.startsWith("```")) cleanJson = cleanJson.slice(3);
  if (cleanJson.endsWith("```")) cleanJson = cleanJson.slice(0, -3);
  cleanJson = cleanJson.trim();

  const parsed = JSON.parse(cleanJson);

  console.log(`\n=== Successfully Compiled Component: <${parsed.componentName} /> ===`);
  console.log(`Props detected: ${parsed.props?.length || 0}`);

  if (outputPath) {
    const resolvedOut = path.resolve(process.cwd(), outputPath);
    fs.writeFileSync(resolvedOut, parsed.html, "utf8");
    console.log(`[SketchCompiler] Written HTML output to ${resolvedOut}`);
  } else {
    console.log("\n--- Generated HTML ---");
    console.log(parsed.html);
  }
}

compile().catch((err) => {
  console.error("[SketchCompiler] Error:", err?.message || err);
  process.exit(1);
});
