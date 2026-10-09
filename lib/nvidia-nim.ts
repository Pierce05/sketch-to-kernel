import { checkNvidiaRateLimit, recordNvidiaRequest } from "@/lib/nvidia-rate-limiter";
import { extractCompilePayload, ExtractedComponentPayload } from "@/lib/json-extractor";
import { sanitizeHtml } from "@/lib/sanitizer";
import { CompileOutputSchema } from "@/lib/schemas";
import { CompileResponse } from "@/lib/types";

export interface NvidiaCompileOptions {
  apiKey: string;
  modelId: string;
  imageDataUrl: string;
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
}: NvidiaCompileOptions): Promise<NvidiaCompileResult> {
  const cleanKey = apiKey.trim();
  // Automatically normalize glm-5-3 to official NVIDIA NIM model ID z-ai/glm-5.3
  const cleanModel = (modelId.trim() || "z-ai/glm-5.3").replace(/glm-5-3/gi, "glm-5.3");

  // 1. Strict 39 RPM rate limit check BEFORE sending any request to NVIDIA
  const rateLimitStatus = checkNvidiaRateLimit(cleanKey);
  if (!rateLimitStatus.allowed) {
    return {
      success: false,
      error: `NVIDIA NIM rate limit reached: 39 requests/minute limit across all models. Next slot available in ${rateLimitStatus.retryAfterSeconds}s. Request held to prevent upstream 429 quota penalty.`,
      status: 429,
      retryAfterSeconds: rateLimitStatus.retryAfterSeconds,
    };
  }

  // 2. Pre-record the request timestamp in the sliding window.
  // NVIDIA NIM counts every attempt towards the 39 RPM quota even if it fails or errors.
  recordNvidiaRequest(cleanKey);

  const promptText = `You are an expert Tailwind CSS frontend architect and UI engineer.
Create a modern, clean, and fully responsive HTML component using Tailwind CSS utility classes based on the user's hand-drawn wireframe.
Ensure semantic HTML, high visual quality, proper contrast, and sensible hover/focus states.
Output ONLY raw, parseable JSON conforming to:
{
  "componentName": "CustomComponent",
  "html": "<div class=\\"...\\">...</div>",
  "props": []
}`;

  try {
    const isVisionModel =
      cleanModel.toLowerCase().includes("vision") ||
      cleanModel.toLowerCase().includes("neva");

    const isReasoningModel =
      cleanModel.toLowerCase().includes("glm") ||
      cleanModel.toLowerCase().includes("r1") ||
      cleanModel.toLowerCase().includes("reason") ||
      cleanModel.toLowerCase().includes("think");

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
              "You are a code generation API. Directly output a valid JSON object with keys: componentName, html (pure HTML with modern Tailwind CSS classes), and props. Do not include reasoning or markdown explanations.",
          },
          {
            role: "user",
            content: `${promptText}\n\nGenerate the complete component now.`,
          },
        ];

    const payload: Record<string, unknown> = {
      model: cleanModel,
      messages,
      temperature: 0.1,
      max_tokens: 4096,
      stream: true,
    };

    // If using a deep-reasoning model like GLM-5.3, set reasoning_effort to 'low'
    // to prevent infinite chain-of-thought token burn (~150s down to ~2s).
    if (isReasoningModel) {
      payload.reasoning_effort = "low";
    }

    const res = await fetch(NVIDIA_NIM_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cleanKey}`,
      },
      body: JSON.stringify(payload),
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

    let accumulatedContent = "";
    let accumulatedReasoning = "";

    if (res.body) {
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed.choices?.[0]?.delta;
              if (delta?.content) accumulatedContent += delta.content;
              if (delta?.reasoning_content) accumulatedReasoning += delta.reasoning_content;
            } catch {}
          }
        }
      }
    }

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
