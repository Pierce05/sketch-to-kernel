/**
 * Fenced-JSON Extractor
 * Extracts valid JSON objects from model outputs that may include markdown code fences,
 * preamble commentary, or trailing text.
 */
export function extractFencedJson<T = unknown>(rawText: string): T {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty or non-string response received from model");
  }

  const text = rawText.trim();

  // Pattern 1: Fenced markdown block ```json ... ``` or ``` ... ```
  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch && fencedMatch[1]) {
    try {
      return JSON.parse(fencedMatch[1].trim()) as T;
    } catch {
      // If fenced contents failed to parse, continue to fallback search
    }
  }

  // Pattern 2: Direct parse if whole string is valid JSON
  try {
    return JSON.parse(text) as T;
  } catch {
    // Continue to substring scan
  }

  // Pattern 3: Extract outermost balanced JSON object { ... }
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const candidate = text.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate) as T;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to parse extracted JSON substring: ${msg}`);
    }
  }

  throw new Error("No parseable JSON object found in model output");
}
