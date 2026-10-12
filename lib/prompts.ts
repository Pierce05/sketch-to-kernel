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
2. In the HTML, you MUST use template variables like {{propName}} for all dynamic text, labels, and customizable styling (e.g. {{title}}, {{buttonText}}, {{color}}). When buttons, badges, or accent elements are present, ALWAYS include an "accentColor" prop (defaulting to a solid hex color like "#2724d1", "#4f46e5", or "#2563eb").
3. Button & Accent Color Responsiveness:
   - Primary buttons and action triggers MUST have an explicit solid background and MUST NEVER be transparent or unstyled.
   - Bind buttons to the accent color dynamically using: style="background-color: var(--accent-color, {{accentColor}});" and class="inline-flex items-center justify-center font-semibold text-white px-4 py-2 rounded-xl shadow-md transition-all hover:opacity-90 active:scale-95".
   - Avoid hardcoding static hover color shades (like hover:bg-indigo-700) on accented buttons; use hover:opacity-90 or hover:brightness-110 so hover states adapt smoothly to any accent color the user selects.
4. Visual Styling & Polish: Architect clean, modern, and beautiful UI with Tailwind CSS utility classes (e.g. flex, grid, gap-4, p-6, rounded-xl, shadow-md, bg-white, border border-slate-200, modern buttons with hover states, sleek inputs with focus rings). Do NOT output unstyled raw HTML elements.
5. Ensure semantic HTML, high visual quality, proper contrast, and sensible hover/focus states.
6. Every template variable {{propName}} used in HTML MUST be defined in the "props" array, and every prop in the "props" array MUST appear as {{propName}} in the HTML markup. Include at least 3-6 relevant props.
7. DO NOT wrap the output in markdown code blocks. Output ONLY raw, parseable JSON conforming to:
{
  "componentName": "string",
  "html": "string containing pure HTML web component markup and {{propName}} variables",
  "props": [
    { "name": "string", "type": "string", "default": "string", "description": "string" }
  ]
}`;
}
