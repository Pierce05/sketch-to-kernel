import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { CompileRequestSchema, CompileOutputSchema } from "@/lib/schemas";
import { extractFencedJson } from "@/lib/json-extractor";
import { sanitizeHtml } from "@/lib/sanitizer";
import { CompileResponse } from "@/lib/types";
import { compileWithNvidiaNim } from "@/lib/nvidia-nim";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Validate request payload with Zod
    const validationResult = CompileRequestSchema.safeParse(rawBody);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request payload",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const {
      image,
      apiKeyType,
      customProvider = "gemini",
      customApiKey,
      customModelId,
    } = validationResult.data;

    // 2. Route to NVIDIA NIM:
    // Key 2 is set to NVIDIA NIM (model "z-ai/glm-5-3")
    // Custom with provider "nvidia" uses user model & key
    const isNvidia =
      apiKeyType === "default_2" ||
      (apiKeyType === "custom" && customProvider === "nvidia");

    if (isNvidia) {
      const nvidiaKey = (
        apiKeyType === "custom"
          ? customApiKey
          : process.env.NVIDIA_KEY_2 ||
            process.env.NVIDIA_API_KEY ||
            process.env.GEMINI_KEY_2
      )?.trim();

      if (!nvidiaKey) {
        return NextResponse.json(
          {
            error:
              apiKeyType === "custom"
                ? "Custom NVIDIA NIM API key is missing. Please configure your key in the settings modal."
                : "Default Key 2 (NVIDIA NIM) is not configured in .env.local (NVIDIA_KEY_2). Please add your NVIDIA key or use Key 1 / Custom.",
          },
          { status: 400 }
        );
      }

      const modelId = (
        apiKeyType === "custom"
          ? customModelId
          : process.env.NVIDIA_MODEL_2
      )?.trim() || "z-ai/glm-5-3";

      // Execute NVIDIA NIM compiler with strict 39 RPM rate limiting (no fallback, clean error handling)
      const nvidiaResult = await compileWithNvidiaNim({
        apiKey: nvidiaKey,
        modelId,
        imageDataUrl: image,
      });

      if (!nvidiaResult.success) {
        return NextResponse.json(
          { error: nvidiaResult.error },
          {
            status: nvidiaResult.status,
            headers: nvidiaResult.retryAfterSeconds
              ? { "Retry-After": String(nvidiaResult.retryAfterSeconds) }
              : undefined,
          }
        );
      }

      return NextResponse.json(nvidiaResult.data, { status: 200 });
    }

    // 3. Route to Gemini API (Key 1 or Custom Gemini):
    const geminiKey = (
      apiKeyType === "custom"
        ? customApiKey
        : process.env.GEMINI_KEY_1
    )?.trim();

    if (!geminiKey) {
      return NextResponse.json(
        {
          error:
            apiKeyType === "custom"
              ? "Custom Gemini API key is missing. Please enter your key in the settings modal."
              : "Default Key 1 (Gemini) is not configured in .env.local (GEMINI_KEY_1).",
        },
        { status: 400 }
      );
    }

    // Dynamic Gemma Fallback:
    // If primary model in env is 26b, fallback switches to 31b.
    // If primary model in env is 31b, fallback switches to 26b.
    const envGemmaModel = (process.env.GEMMA_MODEL || "gemma-4-26b-a4b-it").trim();
    let primaryModel = envGemmaModel;
    let fallbackModel = "gemma-4-31b-it";

    if (envGemmaModel.includes("26b")) {
      primaryModel = envGemmaModel;
      fallbackModel = "gemma-4-31b-it";
    } else if (envGemmaModel.includes("31b")) {
      primaryModel = envGemmaModel;
      fallbackModel = "gemma-4-26b-a4b-it";
    }

    // Extract base64 image data
    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    const mimeType = match ? match[1] : "image/png";
    const rawBase64 = match ? match[2] : image;
    const base64Data = rawBase64.replace(/\s+/g, "");

    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const promptText = `You are an expert Tailwind CSS frontend architect.
Convert the provided hand-drawn UI wireframe or sketch into a modern, clean, and fully responsive HTML component using Tailwind CSS utility classes.
Ensure semantic HTML, proper contrast, and sensible hover/focus states.
DO NOT wrap the output in markdown code blocks (e.g. NO \`\`\`json or \`\`\`html). Output ONLY raw, parseable JSON conforming to:
{
  "componentName": "string",
  "html": "string containing pure HTML with Tailwind classes",
  "props": [
    { "name": "string", "type": "string", "default": "string", "description": "string" }
  ]
}`;

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

    let responseText = "";

    try {
      const response = await ai.models.generateContent({
        model: primaryModel,
        contents: makeContents(),
      });
      responseText = response.text || "";
    } catch (primaryError: unknown) {
      const errStr = primaryError instanceof Error ? primaryError.message : String(primaryError);
      console.warn(`Primary Gemini model (${primaryModel}) failed: ${errStr}. Attempting dynamic fallback to ${fallbackModel}...`);

      if (fallbackModel !== primaryModel) {
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: fallbackModel,
            contents: makeContents(),
          });
          responseText = fallbackResponse.text || "";
        } catch (fallbackError: unknown) {
          const fbErrStr = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          console.error(`Fallback Gemini model (${fallbackModel}) also failed: ${fbErrStr}`);
          throw primaryError;
        }
      } else {
        throw primaryError;
      }
    }

    if (!responseText) {
      throw new Error("Received empty response from Gemma model");
    }

    const rawParsed = extractFencedJson<unknown>(responseText);
    const validatedOutput = CompileOutputSchema.parse(rawParsed);
    const safeHtml = sanitizeHtml(validatedOutput.html);

    const result: CompileResponse = {
      componentName: validatedOutput.componentName,
      html: safeHtml,
      props: validatedOutput.props,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal compilation error";
    console.error("Compilation error in /api/compile:", error);

    return NextResponse.json(
      {
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
