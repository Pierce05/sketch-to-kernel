import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { CompileRequestSchema, CompileOutputSchema } from "@/lib/schemas";
import { extractFencedJson } from "@/lib/json-extractor";
import { sanitizeHtml } from "@/lib/sanitizer";
import { CompileResponse } from "@/lib/types";

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

    const { image, apiKeyType, customApiKey } = validationResult.data;

    // 2. Resolve API Key per Blueprint rules
    let apiKey: string | undefined;
    if (apiKeyType === "custom" && customApiKey) {
      apiKey = customApiKey.trim();
    } else if (apiKeyType === "default_1") {
      apiKey = process.env.GEMINI_KEY_1?.trim();
    } else if (apiKeyType === "default_2") {
      apiKey = process.env.GEMINI_KEY_2?.trim();
    } else if (customApiKey) {
      apiKey = customApiKey.trim();
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No valid API key configured. Provide a custom Gemini key or configure GEMINI_KEY_1 / GEMINI_KEY_2 in .env.local",
        },
        { status: 400 }
      );
    }

    // 3. Extract and clean base64 image data
    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    const mimeType = match ? match[1] : "image/png";
    const rawBase64 = match ? match[2] : image;
    const base64Data = rawBase64.replace(/\s+/g, "");

    // 4. Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey });

    // Models sequence: Target Gemma 4 31B first, with Gemma 4 26B fallback
    const primaryModel = process.env.GEMMA_MODEL || "gemma-4-31b-it";
    const fallbackModel = "gemma-4-26b-a4b-it";

    const promptText = `You are an expert Tailwind CSS frontend architect.
Convert the provided hand-drawn UI wireframe or sketch into a modern, clean, and fully responsive HTML component using Tailwind CSS utility classes.
Ensure semantic HTML, proper contrast, and sensible hover/focus states.
DO NOT wrap the output in markdown code blocks (e.g. NO json or html). Output ONLY raw, parseable JSON conforming to:
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

    // 5. Model Execution with intelligent retry/fallback for 500 INTERNAL errors
    try {
      const response = await ai.models.generateContent({
        model: primaryModel,
        contents: makeContents(),
      });
      responseText = response.text || "";
    } catch (primaryError: unknown) {
      const errStr = primaryError instanceof Error ? primaryError.message : String(primaryError);
      console.warn(`Primary model (${primaryModel}) encountered issue: ${errStr}. Attempting fallback to ${fallbackModel}...`);

      if (fallbackModel !== primaryModel) {
        try {
          const fallbackResponse = await ai.models.generateContent({
            model: fallbackModel,
            contents: makeContents(),
          });
          responseText = fallbackResponse.text || "";
        } catch (fallbackError: unknown) {
          const fbErrStr = fallbackError instanceof Error ? fallbackError.message : String(fallbackError);
          console.error(`Fallback model (${fallbackModel}) also failed: ${fbErrStr}`);
          throw primaryError; // Re-throw to be handled gracefully
        }
      } else {
        throw primaryError;
      }
    }

    if (!responseText) {
      throw new Error("Received empty response from Gemma model");
    }

    // 6. Extract fenced JSON (handling ```json, ```, and stray text)
    const rawParsed = extractFencedJson<unknown>(responseText);

    // 7. Validate model output schema with Zod
    const validatedOutput = CompileOutputSchema.parse(rawParsed);

    // 8. Sanitize HTML output (strip scripts, event handlers, javascript: URLs)
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
