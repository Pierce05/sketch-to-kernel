/**
 * Resilient JSON & Component Payload Extractor
 * Extracts valid JSON objects or reconstructs complete component payloads from model outputs
 * that may include markdown code fences (```json, ```html, ```diff), unescaped quotes,
 * commentary, raw HTML tags, or diff patches.
 */

export interface ExtractedComponentProp {
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface ExtractedComponentPayload {
  componentName: string;
  html: string;
  props: ExtractedComponentProp[];
}

/**
 * Checks whether a given string contains HTML tags
 */
export function containsHtmlTags(str: string): boolean {
  return /<[a-zA-Z][a-zA-Z0-9-]*\b[^>]*>/i.test(str);
}

/**
 * Derives a clean component name from HTML contents or returns the fallback
 */
export function deriveComponentName(html: string, fallback = "CompiledComponent"): string {
  const lower = html.toLowerCase();
  if (lower.includes("<button")) return "ActionButton";
  if (lower.includes("<nav")) return "Navbar";
  if (lower.includes("<form")) return "FormSection";
  if (lower.includes("<table")) return "DataTable";
  if (lower.includes("<header")) return "HeaderBanner";
  if (lower.includes("<footer")) return "Footer";
  if (lower.includes("rounded-") && lower.includes("shadow")) return "ContentCard";
  return fallback;
}

/**
 * Normalizes props array to schema-compliant objects
 */
export function normalizeProps(rawProps: unknown): ExtractedComponentProp[] {
  if (!Array.isArray(rawProps)) return [];
  return rawProps
    .map((item, idx) => {
      if (typeof item === "string") {
        return {
          name: item.trim() || `prop_${idx}`,
          type: "string",
          default: "",
          description: "",
        };
      }
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return {
          name: typeof record.name === "string" && record.name.trim() ? record.name.trim() : `prop_${idx}`,
          type: typeof record.type === "string" && record.type.trim() ? record.type.trim() : "string",
          default: typeof record.default === "string" ? record.default : "",
          description: typeof record.description === "string" ? record.description : "",
        };
      }
      return null;
    })
    .filter((p): p is ExtractedComponentProp => p !== null && Boolean(p.name));
}

/**
 * Synthesizes interactive props from HTML if the model did not supply any props.
 * Extracts template tokens {{token}} or text nodes from buttons, headings, etc.
 */
export function synthesizePropsFromHtml(html: string): ExtractedComponentProp[] {
  const props: ExtractedComponentProp[] = [];
  const seenNames = new Set<string>();

  // 1. Check for {{propName}} tokens
  const tokenMatches = html.matchAll(/{{\s*([a-zA-Z0-9_]+)\s*}}/g);
  for (const match of tokenMatches) {
    const name = match[1];
    if (name && !seenNames.has(name.toLowerCase())) {
      seenNames.add(name.toLowerCase());
      props.push({
        name,
        type: "string",
        default: name.charAt(0).toUpperCase() + name.slice(1),
        description: `Dynamic ${name} content`,
      });
    }
  }

  if (props.length > 0) return props;

  // 2. Extract from heading
  const headingMatch = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
  if (headingMatch && headingMatch[1].trim()) {
    const text = headingMatch[1].trim();
    seenNames.add("title");
    props.push({
      name: "title",
      type: "string",
      default: text,
      description: "Component header title",
    });
  }

  // 3. Extract from button
  const buttonMatch = html.match(/<button[^>]*>([^<]+)<\/button>/i);
  if (buttonMatch && buttonMatch[1].trim()) {
    const text = buttonMatch[1].trim();
    seenNames.add("buttonText");
    props.push({
      name: "buttonText",
      type: "string",
      default: text,
      description: "Call-to-action button label",
    });
  }

  // 4. Extract from paragraph
  const pMatch = html.match(/<p[^>]*>([^<]+)<\/p>/i);
  if (pMatch && pMatch[1].trim()) {
    const text = pMatch[1].trim();
    seenNames.add("description");
    props.push({
      name: "description",
      type: "string",
      default: text.slice(0, 60),
      description: "Description or subtitle text",
    });
  }

  // 5. Ensure at least default interactive props exist
  if (props.length === 0) {
    props.push({
      name: "label",
      type: "string",
      default: "Active Component",
      description: "Primary component label",
    });
  }

  return props;
}

/**
 * Repairs common LLM JSON syntax mistakes:
 * - Trailing commas before } or ]
 * - Unescaped control characters / newlines inside string literals
 */
export function repairJsonString(jsonStr: string): string | null {
  try {
    let cleaned = jsonStr.replace(/,\s*([}\]])/g, "$1");
    cleaned = cleaned.replace(/"((?:[^"\\]|\\.)*)"/g, (match) => {
      return match
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r")
        .replace(/\t/g, "\\t");
    });
    return cleaned;
  } catch {
    return null;
  }
}

/**
 * Extracts pure code from git/diff formatted text
 * Filters out deletions (-) and diff headers, keeps additions (+) and context
 */
export function extractFromDiffText(diffText: string): string {
  const lines = diffText.split("\n");
  const resultLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith("---") || line.startsWith("+++") || line.startsWith("@@")) continue;
    if (line.startsWith("-")) continue;
    if (line.startsWith("+")) {
      resultLines.push(line.replace(/^\+\s?/, ""));
    } else {
      resultLines.push(line);
    }
  }
  return resultLines.join("\n").trim();
}

/**
 * Finds and extracts the outermost HTML tag block from plain text
 */
export function extractOutermostHtml(str: string): string | null {
  const firstTagIndex = str.search(/<([a-zA-Z][a-zA-Z0-9-]*)\b/);
  if (firstTagIndex !== -1) {
    const lastTagIndex = str.lastIndexOf(">");
    if (lastTagIndex > firstTagIndex) {
      const candidate = str.substring(firstTagIndex, lastTagIndex + 1).trim();
      if (candidate.length > 5 && containsHtmlTags(candidate)) {
        return candidate;
      }
    }
  }
  return null;
}

/**
 * Attempts regex extraction of componentName and html from malformed JSON
 */
export function extractHtmlViaRegex(str: string): { componentName: string | null; html: string } | null {
  const compMatch = str.match(/"componentName"\s*:\s*"([^"]+)"/i);
  const componentName = compMatch ? compMatch[1].trim() : null;

  const htmlMatch =
    str.match(/"html"\s*:\s*"([\s\S]*?)"(?=\s*,\s*"props"|\s*\}|\s*$)/i) ||
    str.match(/"html"\s*:\s*`([\s\S]*?)`/i) ||
    str.match(/"html"\s*:\s*'([\s\S]*?)'(?=\s*,\s*'props'|\s*\}|\s*$)/i);

  if (htmlMatch && htmlMatch[1]) {
    const unescaped = htmlMatch[1]
      .replace(/\\"/g, '"')
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "");
    if (containsHtmlTags(unescaped)) {
      return { html: unescaped, componentName };
    }
  }
  return null;
}

/**
 * Extracts a typed JSON object from raw text.
 * Falls back to repairing common JSON syntax errors.
 */
// NOTE: Empty catch blocks below are intentional. Each parse strategy silently
// falls through to the next on failure: raw JSON → repaired JSON → substring → error.
export function extractFencedJson<T = unknown>(rawText: string): T {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty or non-string response received from model");
  }

  const text = rawText.trim();

  // Pattern 1: Fenced markdown block ```json ... ``` or ``` ... ```
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch && fencedMatch[1]) {
    const cand = fencedMatch[1].trim();
    try {
      return JSON.parse(cand) as T;
    } catch {
      const repaired = repairJsonString(cand);
      if (repaired) {
        try {
          return JSON.parse(repaired) as T;
        } catch {}
      }
    }
  }

  // Pattern 2: Direct parse if whole string is valid JSON
  try {
    return JSON.parse(text) as T;
  } catch {
    const repaired = repairJsonString(text);
    if (repaired) {
      try {
        return JSON.parse(repaired) as T;
      } catch {}
    }
  }

  // Pattern 3: Extract outermost balanced JSON object { ... }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch {
      const repaired = repairJsonString(candidate);
      if (repaired) {
        try {
          return JSON.parse(repaired) as T;
        } catch {}
      }
    }
  }

  throw new Error("No parseable JSON object found in model output");
}

/**
 * Resilient multi-format compiler payload extractor.
 * Handles pure JSON, fenced JSON, markdown HTML blocks, diff blocks,
 * raw HTML markup, and malformed strings.
 */
export function extractCompilePayload(
  rawText: string,
  fallbackName = "CompiledComponent"
): ExtractedComponentPayload {
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    throw new Error("Empty model output received");
  }

  const text = rawText.trim();

  // Strategy 1: Standard and repaired JSON parsing
  const jsonCandidates: string[] = [];
  const fencedJson = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedJson && fencedJson[1]) {
    jsonCandidates.push(fencedJson[1].trim());
  }
  jsonCandidates.push(text);

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    jsonCandidates.push(text.substring(firstBrace, lastBrace + 1));
  }

  for (const cand of jsonCandidates) {
    try {
      const parsed = JSON.parse(cand) as Record<string, unknown>;
      if (parsed && typeof parsed === "object" && typeof parsed.html === "string" && parsed.html.trim()) {
        const rawProps = normalizeProps(parsed.props);
        return {
          componentName:
            typeof parsed.componentName === "string" && parsed.componentName.trim()
              ? parsed.componentName.trim()
              : deriveComponentName(parsed.html, fallbackName),
          html: parsed.html.trim(),
          props: rawProps.length > 0 ? rawProps : synthesizePropsFromHtml(parsed.html),
        };
      }
    } catch {}

    const rep = repairJsonString(cand);
    if (rep) {
      try {
        const parsed = JSON.parse(rep) as Record<string, unknown>;
        if (parsed && typeof parsed === "object" && typeof parsed.html === "string" && parsed.html.trim()) {
          const rawProps = normalizeProps(parsed.props);
          return {
            componentName:
              typeof parsed.componentName === "string" && parsed.componentName.trim()
                ? parsed.componentName.trim()
                : deriveComponentName(parsed.html, fallbackName),
            html: parsed.html.trim(),
            props: rawProps.length > 0 ? rawProps : synthesizePropsFromHtml(parsed.html),
          };
        }
      } catch {}
    }
  }

  // Strategy 2: Fenced HTML / XML / JSX code block
  const codeBlockMatch = text.match(/```(?:html|xml|jsx|tsx)?\s*([\s\S]*?)```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    const code = codeBlockMatch[1].trim();
    if (containsHtmlTags(code)) {
      return {
        componentName: deriveComponentName(code, fallbackName),
        html: code,
        props: synthesizePropsFromHtml(code),
      };
    }
  }

  // Strategy 3: Fenced diff code block
  const diffBlockMatch = text.match(/```diff\s*([\s\S]*?)```/i);
  if (diffBlockMatch && diffBlockMatch[1]) {
    const extracted = extractFromDiffText(diffBlockMatch[1]);
    if (extracted && containsHtmlTags(extracted)) {
      return {
        componentName: deriveComponentName(extracted, fallbackName),
        html: extracted,
        props: synthesizePropsFromHtml(extracted),
      };
    }
  }

  // Strategy 4: Regex-based extraction of "html" and "componentName"
  const regexExtracted = extractHtmlViaRegex(text);
  if (regexExtracted) {
    return {
      componentName: regexExtracted.componentName || deriveComponentName(regexExtracted.html, fallbackName),
      html: regexExtracted.html,
      props: synthesizePropsFromHtml(regexExtracted.html),
    };
  }

  // Strategy 5: Unfenced diff lines (+ <div...)
  if (text.includes("+ <") || text.includes("+\t<") || text.includes("+<")) {
    const diffExtracted = extractFromDiffText(text);
    if (diffExtracted && containsHtmlTags(diffExtracted)) {
      return {
        componentName: deriveComponentName(diffExtracted, fallbackName),
        html: diffExtracted,
        props: synthesizePropsFromHtml(diffExtracted),
      };
    }
  }

  // Strategy 6: Outermost HTML element tags
  const rawHtml = extractOutermostHtml(text);
  if (rawHtml) {
    return {
      componentName: deriveComponentName(rawHtml, fallbackName),
      html: rawHtml,
      props: synthesizePropsFromHtml(rawHtml),
    };
  }

  throw new Error("No parseable HTML component or JSON object found in model output");
}
