import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { CompileRequestSchema, CompileOutputSchema } from "@/lib/schemas";
import { extractCompilePayload } from "@/lib/json-extractor";
import { sanitizeHtml } from "@/lib/sanitizer";
import { CompileResponse } from "@/lib/types";
import { compileWithNvidiaNim } from "@/lib/nvidia-nim";
import { compileWithCustomEndpoint } from "@/lib/custom-endpoint";
import { getClientIp, takeIpSlot } from "@/lib/ip-rate-limit";
import { takeApiSlot, keyId } from "@/lib/api-rate-limiter";
import { buildCompilePrompt } from "@/lib/prompts";

export const maxDuration = 60;

const MAX_BODY_BYTES = 8_000_000;
// Total time budget for all Gemini calls in one request (the function limit is 60s).
const GEMINI_BUDGET_MS = 55_000;
// Shared default keys (Key 1 / Key 2) are limited per client IP. Custom keys are the user's own.
const DEFAULT_KEY_LIMIT_PER_MIN = 12;
// Gemini API key rate limit (requests per minute).
const GEMINI_RPM = 29;

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

function errorResponse(
  status: number,
  error: string,
  headers?: Record<string, string>,
  details?: unknown,
) {
  return NextResponse.json(details ? { error, details } : { error }, {
    status,
    headers,
  });
}

/** Turn a Gemini SDK error into an HTTP status and a message that is safe to show. */
function classifyError(err: unknown): { status: number; message: string } {
  if (err instanceof HttpError) return { status: err.status, message: err.message };
  const message = err instanceof Error ? err.message : String(err);
  const code = (err as { status?: unknown })?.status;
  if (code === 429 || /429|RESOURCE_EXHAUSTED|quota|rate limit/i.test(message)) {
    return { status: 429, message: "Gemini rate limit reached for this key. Wait a moment and try again." };
  }
  if (
    code === 401 ||
    code === 403 ||
    /API key|API_KEY|PERMISSION_DENIED|UNAUTHENTICATED/i.test(message)
  ) {
    return { status: 401, message: "The Gemini API key was rejected. Check the key and try again." };
  }
  return { status: 502, message: `Gemini API error: ${message.slice(0, 300)}` };
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new HttpError(504, "Gemini took too long to respond. Please try again.")),
      ms,
    );
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export async function POST(req: NextRequest) {
  try {
    // 0. Body size guard: reject oversized payloads before parsing them
    const declaredBytes = Number(req.headers.get("content-length") ?? 0);
    if (declaredBytes > MAX_BODY_BYTES) {
      return errorResponse(413, "Request is too large. Use a smaller sketch or image.");
    }
    const bodyText = await req.text();
    if (bodyText.length > MAX_BODY_BYTES) {
      return errorResponse(413, "Request is too large. Use a smaller sketch or image.");
    }

    let rawBody: unknown;
    try {
      rawBody = JSON.parse(bodyText);
    } catch {
      return errorResponse(400, "Request body must be valid JSON.");
    }

    // 1. Validate request payload with Zod
    const validationResult = CompileRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return errorResponse(
        400,
        "Invalid request payload",
        undefined,
        validationResult.error.flatten(),
      );
    }

    const {
      image,
      apiKeyType,
      customProvider = "gemini",
      customApiKey,
      customModelId,
      customEndpoint,
      wireframeDescription,
      enableThinking = false,
    } = validationResult.data;

    // 1b. Per-IP limit on the shared default keys, so they cannot be drained by one client
    if (apiKeyType !== "custom") {
      const slot = takeIpSlot(getClientIp(req.headers), DEFAULT_KEY_LIMIT_PER_MIN);
      if (!slot.allowed) {
        return errorResponse(
          429,
          `Too many requests from your network. Try again in ${slot.retryAfterSeconds}s, or use your own API key.`,
          { "Retry-After": String(slot.retryAfterSeconds) },
        );
      }
    }

    // 2. Route to Custom OpenAI-compatible Endpoint:
    if (apiKeyType === "custom" && customProvider === "custom") {
      if (!customEndpoint?.trim()) {
        return errorResponse(400, "Custom endpoint URL is required.");
      }
      const modelId = customModelId?.trim() || "default";

      const customResult = await compileWithCustomEndpoint({
        endpoint: customEndpoint,
        apiKey: customApiKey ?? "",
        modelId,
        imageDataUrl: image,
        wireframeDescription,
        enableThinking,
      });

      if (!customResult.success) {
        return errorResponse(
          customResult.status,
          customResult.error ?? "Custom endpoint compilation failed.",
        );
      }

      return NextResponse.json(customResult.data, { status: 200 });
    }

    // 3. Route to NVIDIA NIM:
    // Key 2 is set to NVIDIA NIM (model "z-ai/glm-5.3")
    // Custom with provider "nvidia" uses user model & key
    const isNvidia =
      apiKeyType === "default_2" ||
      (apiKeyType === "custom" && customProvider === "nvidia");

    if (isNvidia) {
      // No cross-provider fallback: a Gemini key must never be sent to NVIDIA.
      const nvidiaKey = (
        apiKeyType === "custom"
          ? customApiKey
          : process.env.NVIDIA_KEY_2 || process.env.NVIDIA_API_KEY
      )?.trim();

      if (!nvidiaKey) {
        return errorResponse(
          400,
          apiKeyType === "custom"
            ? "Custom NVIDIA NIM API key is missing. Please configure your key in the settings modal."
            : "Default Key 2 (NVIDIA NIM) is not configured in .env.local (NVIDIA_KEY_2). Please add your NVIDIA key or use Key 1 / Custom.",
        );
      }

      const modelId =
        (apiKeyType === "custom" ? customModelId : process.env.NVIDIA_MODEL_2)?.trim() ||
        "z-ai/glm-5.3";

      // Execute NVIDIA NIM compiler with strict 39 RPM rate limiting (no fallback, clean error handling)
      const nvidiaResult = await compileWithNvidiaNim({
        apiKey: nvidiaKey,
        modelId,
        imageDataUrl: image,
        wireframeDescription,
        enableThinking,
      });

      if (!nvidiaResult.success) {
        return errorResponse(
          nvidiaResult.status,
          nvidiaResult.error ?? "NVIDIA NIM compilation failed.",
          nvidiaResult.retryAfterSeconds
            ? { "Retry-After": String(nvidiaResult.retryAfterSeconds) }
            : undefined,
        );
      }

      return NextResponse.json(nvidiaResult.data, { status: 200 });
    }

    // 3. Route to Gemini API (Key 1 or Custom Gemini):
    const geminiKey = (
      apiKeyType === "custom" ? customApiKey : process.env.GEMINI_KEY_1
    )?.trim();

    if (!geminiKey) {
      return errorResponse(
        400,
        apiKeyType === "custom"
          ? "Custom Gemini API key is missing. Please enter your key in the settings modal."
          : "Default Key 1 (Gemini) is not configured in .env.local (GEMINI_KEY_1).",
      );
    }

    // 3b. Per-key Gemini rate limit: 29 RPM
    const geminiSlot = takeApiSlot(keyId("gemini", geminiKey), GEMINI_RPM);
    if (!geminiSlot.allowed) {
      return errorResponse(
        429,
        `Gemini rate limit reached (${GEMINI_RPM} req/min). Try again in ${geminiSlot.retryAfterSeconds}s.`,
        { "Retry-After": String(geminiSlot.retryAfterSeconds) },
      );
    }

    // Dynamic Gemma fallback: a 26b primary falls back to 31b, and a 31b primary falls back to 26b.
    const primaryModel = (process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it").trim();
    const fallbackModel =
      !primaryModel.includes("26b") && primaryModel.includes("31b")
        ? "gemma-4-26b-a4b-it"
        : "gemma-4-31b-it";

    // Extract base64 image data
    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    const mimeType = match ? match[1] : "image/png";
    const rawBase64 = match ? match[2] : image;
    const base64Data = rawBase64.replace(/\s+/g, "");

    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const promptText = buildCompilePrompt(wireframeDescription);

    const makeContents = () => [
      {
        role: "user" as const,
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
    ];

    // One generation attempt: primary model, then the fallback model.
    // A rejected key is not retried on the fallback model, since it cannot help.
    const deadline = Date.now() + GEMINI_BUDGET_MS;
    const generateText = async (): Promise<string> => {
      let lastError: unknown = new Error("No model was tried");
      for (const model of new Set([primaryModel, fallbackModel])) {
        const remainingMs = deadline - Date.now();
        if (remainingMs < 2_000) {
          lastError = new HttpError(504, "Gemini took too long to respond. Please try again.");
          break;
        }
        try {
          const response = await withTimeout(
            ai.models.generateContent({ model, contents: makeContents() }),
            remainingMs,
          );
          const text = response.text;
          if (text) return text;
          lastError = new Error("Received empty response from Gemma model");
        } catch (err) {
          lastError = err;
          const detail = err instanceof Error ? err.message : String(err);
          console.warn(`Gemini model (${model}) failed: ${detail}`);
          if (classifyError(err).status === 401) break;
        }
      }
      const { status, message } = classifyError(lastError);
      throw new HttpError(status, message);
    };

    // Retry once if the model's output cannot be parsed into a valid component
    let lastParseError = "unknown error";
    for (let attempt = 1; attempt <= 2; attempt++) {
      const responseText = await generateText();
      try {
        const rawParsed = extractCompilePayload(responseText);
        const validatedOutput = CompileOutputSchema.parse(rawParsed);
        const safeHtml = sanitizeHtml(validatedOutput.html);

        const result: CompileResponse = {
          componentName: validatedOutput.componentName,
          html: safeHtml,
          props: validatedOutput.props,
        };
        return NextResponse.json(result, { status: 200 });
      } catch (parseError: unknown) {
        lastParseError = parseError instanceof Error ? parseError.message : String(parseError);
        console.warn(`Gemini output rejected (attempt ${attempt}): ${lastParseError}`);
      }
    }

    console.error(`Gemini output failed validation twice: ${lastParseError}`);
    return errorResponse(
      502,
      "The model returned a component we could not use. Please try again.",
    );
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      return errorResponse(error.status, error.message);
    }
    console.error("Compilation error in /api/compile:", error);
    return errorResponse(500, "Internal compilation error");
  }
}