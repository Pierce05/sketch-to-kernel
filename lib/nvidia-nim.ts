import { takeApiSlot, keyId } from "@/lib/api-rate-limiter";
import { extractCompilePayload, ExtractedComponentPayload } from "@/lib/json-extractor";
import { sanitizeHtml } from "@/lib/sanitizer";
import { CompileOutputSchema } from "@/lib/schemas";
import { CompileResponse } from "@/lib/types";
import { readSseStream } from "@/lib/sse";
import { buildCompilePrompt } from "@/lib/prompts";

export interface NvidiaCompileOptions {
  apiKey: string;
  modelId: string;
  imageDataUrl: string;
  wireframeDescription?: string;
  enableThinking?: boolean;
}

export interface NvidiaCompileResult {
  success: boolean;
  data?: CompileResponse;
  error?: string;
  status: number;
  retryAfterSeconds?: number;
}

const NVIDIA_NIM_ENDPOINT = "https://integrate.api.nvidia.com/v1/chat/completions";

export async function compileWithNvidiaNim({
  apiKey,
  modelId,
  imageDataUrl,
  wireframeDescription,
  enableThinking = false,
}: NvidiaCompileOptions): Promise<NvidiaCompileResult> {
  const cleanKey = apiKey.trim();
  // Normalize model IDs (e.g. gpt-oss-20b -> openai/gpt-oss-20b, glm-5-3 -> z-ai/glm-5.3)
  let cleanModel = modelId.trim() || "z-ai/glm-5.3";
  if (cleanModel.toLowerCase() === "glm-5.3" || cleanModel.toLowerCase() === "glm-5-3") {
    cleanModel = "z-ai/glm-5.3";
  } else if (cleanModel.toLowerCase() === "gpt-oss-20b") {
    cleanModel = "openai/gpt-oss-20b";
  } else {
    cleanModel = cleanModel.replace(/glm-5-3/gi, "glm-5.3");
  }

  const isVisionModel =
    cleanModel.toLowerCase().includes("vision") ||
    cleanModel.toLowerCase().includes("neva");

  // Text-only models never receive the image. Without the canvas wireframe
  // description there is nothing to build from, so fail early with a clear message.
  if (!isVisionModel && !wireframeDescription?.trim()) {
    return {
      success: false,
      error: `${cleanModel} cannot read images. Draw your sketch on the canvas (Key 2 uses the canvas structure), or switch to Key 1 (Gemma reads images).`,
      status: 400,
    };
  }

  // Atomic 39 RPM rate limit: check and record in one step (no TOCTOU race)
  const slot = takeApiSlot(keyId("nvidia", cleanKey), 39);
  if (!slot.allowed) {
    return {
      success: false,
      error: `NVIDIA NIM rate limit reached: 39 requests/minute. Next slot in ${slot.retryAfterSeconds}s.`,
      status: 429,
      retryAfterSeconds: slot.retryAfterSeconds,
    };
  }

  const promptText = buildCompilePrompt(wireframeDescription);

  try {
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
    // GLM on NIM ignores enable_thinking. reasoning_effort is what actually limits reasoning.
    if (!enableThinking) payload.reasoning_effort = "low";

    const res = await fetch(NVIDIA_NIM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanKey}`,
      },
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
        error: `NVIDIA NIM API Error (${cleanModel}): ${parsedMsg}`,
        status: res.status,
      };
    }

    const { content: accumulatedContent, reasoning: accumulatedReasoning } = res.body
      ? await readSseStream(res.body)
      : { content: "", reasoning: "" };

    let payloadResult: ExtractedComponentPayload | null = null;
    let extractionError: string | null = null;

    // Priority 1: Extract component from accumulated response content
    if (accumulatedContent.trim()) {
      try {
        payloadResult = extractCompilePayload(accumulatedContent.trim());
      } catch (e: unknown) {
        extractionError = e instanceof Error ? e.message : String(e);
      }
    }

    // Priority 2: If content was empty or unparseable, salvage HTML/JSON from reasoning chunks
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
        error: `NVIDIA NIM (${cleanModel}) compilation failed: ${extractionError || "No valid HTML component or JSON found in model output"}`,
        status: 502,
      };
    }

    // Sanitize HTML and validate against output schema
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
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: `NVIDIA NIM compilation failed (${cleanModel}): ${errMessage}`,
      status: 500,
    };
  }
}
