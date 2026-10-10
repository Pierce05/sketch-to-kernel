/**
 * Shared LLM prompt for sketch-to-component compilation.
 * Used by both the Gemini (route.ts) and NVIDIA NIM (nvidia-nim.ts) paths
 * so prompt updates automatically apply to both providers.
 */
export function buildCompilePrompt(wireframeDescription?: string): string {
  const wireframeContext = wireframeDescription?.trim()
    ? `\n\nCANVAS WIREFRAME STRUCTURE & ELEMENTS DETECTED:\n${wireframeDescription.trim()}`
    : "";

  return `You are an expert web component frontend architect.
Convert the provided hand-drawn UI wireframe or sketch into a modern, clean, and fully responsive HTML web component.${wireframeContext}

STRICT REQUIREMENTS:
1. Accurately replicate the layout, labels, buttons, inputs, and components shown in the sketch.
2. In the HTML, you MUST use template variables like {{propName}} for all dynamic text, labels, and customizable styling (e.g. {{title}}, {{buttonText}}, {{color}}).
3. Visual Styling & Polish: Architect clean, modern, and beautiful UI with Tailwind CSS utility classes (e.g. flex, grid, gap-4, p-6, rounded-xl, shadow-md, bg-white, border border-slate-200, modern buttons with hover states, sleek inputs with focus rings). Do NOT output unstyled raw HTML elements.
4. Ensure semantic HTML, high visual quality, proper contrast, and sensible hover/focus states.
5. You MUST include a non-empty, detailed "props" array with at least 3-6 relevant props matching the template variables.
6. DO NOT wrap the output in markdown code blocks. Output ONLY raw, parseable JSON conforming to:
{
  "componentName": "string",
  "html": "string containing pure HTML web component markup and {{propName}} variables",
  "props": [
    { "name": "string", "type": "string", "default": "string", "description": "string" }
  ]
}`;
}
