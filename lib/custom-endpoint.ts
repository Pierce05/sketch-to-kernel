import { extractCompilePayload, ExtractedComponentPayload } from "@/lib/json-extractor";
import { sanitizeHtml } from "@/lib/sanitizer";
import { CompileOutputSchema } from "@/lib/schemas";
import { CompileResponse } from "@/lib/types";
import { readSseStream } from "@/lib/sse";
import { buildCompilePrompt } from "@/lib/prompts";

export interface CustomEndpointCompileOptions {
  endpoint: string;
  apiKey?: string;
  modelId: string;
  imageDataUrl: string;
  wireframeDescription?: string;
  enableThinking?: boolean;
}

export interface CustomEndpointCompileResult {
  success: boolean;
  data?: CompileResponse;
  error?: string;
  status: number;
}

/**
 * Normalizes user-supplied endpoint URLs to a full chat/completions endpoint.
 * Handles:
 * - "https://api.openai.com/v1/chat/completions" -> unchanged
 * - "https://api.openai.com/v1" -> "https://api.openai.com/v1/chat/completions"
 * - "http://localhost:11434" -> "http://localhost:11434/v1/chat/completions"
 */
export function normalizeEndpointUrl(rawUrl: string): string {
  let trimmed = rawUrl.trim();
  if (!trimmed) return "";
  trimmed = trimmed.replace(/\/+$/, "");
  if (trimmed.endsWith("/chat/completions")) {
    return trimmed;
  }
  if (trimmed.endsWith("/v1")) {
    return `${trimmed}/chat/completions`;
  }
  return `${trimmed}/v1/chat/completions`;
}

export async function compileWithCustomEndpoint({
  endpoint,
  apiKey = "",
  modelId,
  imageDataUrl,
  wireframeDescription,
  enableThinking = false,
}: CustomEndpointCompileOptions): Promise<CustomEndpointCompileResult> {
  const cleanEndpoint = normalizeEndpointUrl(endpoint);
  if (!cleanEndpoint) {
    return {
      success: false,
      error: "Custom endpoint URL is required.",
      status: 400,
    };
  }

  const cleanModel = modelId.trim() || "default";
  const cleanKey = apiKey.trim();

  const isVisionModel =
    cleanModel.toLowerCase().includes("vision") ||
    cleanModel.toLowerCase().includes("4o") ||
    cleanModel.toLowerCase().includes("vl") ||
    cleanModel.toLowerCase().includes("pixtral") ||
    cleanModel.toLowerCase().includes("llava") ||
    cleanModel.toLowerCase().includes("claude-3") ||
    cleanModel.toLowerCase().includes("gemini");

  if (!isVisionModel && !wireframeDescription?.trim()) {
    return {
      success: false,
      error: `Model '${cleanModel}' may not support vision inputs. Draw your sketch on the canvas so the wireframe structure can be analyzed, or select a vision-capable model.`,
      status: 400,
    };
  }

  const promptText = buildCompilePrompt(wireframeDescription);

  const messages = isVisionModel
    ? [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText,
            },
            {
              type: "image_url",
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ]
    : [
        {
          role: "system",
          content:
            "You are a code generation API. Do not think, deliberate, or provide chain-of-thought explanations. No thinking. Output ONLY the raw JSON object directly.",
        },
        {
          role: "user",
          content: `${promptText}\n\nGenerate the complete component now. Output JSON only.`,
        },
      ];

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (cleanKey) {
    headers["Authorization"] = `Bearer ${cleanKey}`;
  }

  const payload: Record<string, unknown> = {
    model: cleanModel,
    messages,
    temperature: 0.1,
    max_tokens: 8192,
    stream: true,
    chat_template_kwargs: {
      enable_thinking: Boolean(enableThinking),
    },
  };

  try {
    const res = await fetch(cleanEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(55_000),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      let parsedMsg = "";
      try {
        const errorJson = JSON.parse(errorText);
        parsedMsg = errorJson?.error?.message || errorJson?.message || errorText;
      } catch {
        parsedMsg = errorText || `HTTP ${res.status}`;
      }

      return {
        success: false,
        error: `Custom Endpoint Error (${cleanModel}): ${parsedMsg}`,
        status: res.status,
      };
    }

    const contentType = res.headers.get("content-type") || "";
    let accumulatedContent = "";
    let accumulatedReasoning = "";

    // If streaming SSE response
    if (contentType.includes("text/event-stream") && res.body) {
      const sseResult = await readSseStream(res.body);
      accumulatedContent = sseResult.content;
      accumulatedReasoning = sseResult.reasoning;
    } else {
      // Direct JSON response or standard text
      const rawText = await res.text();
      try {
        const parsedJson = JSON.parse(rawText);
        const choice = parsedJson?.choices?.[0];
        accumulatedContent = choice?.message?.content || choice?.text || rawText;
      } catch {
        accumulatedContent = rawText;
      }
    }

    let payloadResult: ExtractedComponentPayload | null = null;
    let extractionError: string | null = null;

    if (accumulatedContent.trim()) {
      try {
        payloadResult = extractCompilePayload(accumulatedContent.trim());
      } catch (e: unknown) {
        extractionError = e instanceof Error ? e.message : String(e);
      }
    }

    if (!payloadResult && accumulatedReasoning.trim()) {
      try {
        payloadResult = extractCompilePayload(accumulatedReasoning.trim());
      } catch (e: unknown) {
        if (!extractionError) {
          extractionError = e instanceof Error ? e.message : String(e);
        }
      }
    }

    if (!payloadResult) {
      return {
        success: false,
        error: `Custom Endpoint compilation failed: ${extractionError || "No valid HTML component or JSON found in model output"}`,
        status: 502,
      };
    }

    const sanitizedHtml = sanitizeHtml(payloadResult.html || "");

    const validatedOutput = CompileOutputSchema.parse({
      componentName: payloadResult.componentName || "CompiledComponent",
      html: sanitizedHtml,
      props: payloadResult.props || [],
    });

    return {
      success: true,
      data: validatedOutput,
      status: 200,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      error: `Custom Endpoint request failed: ${message}`,
      status: 500,
    };
  }
}
