import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { CompileRequest, CompileResponse } from "@/lib/types";

const PropSchema = z.object({
  name: z.string(),
  type: z.string(),
  default: z.string(),
  description: z.string(),
});

const CompileOutputSchema = z.object({
  componentName: z.string(),
  html: z.string(),
  props: z.array(PropSchema),
});

export async function POST(req: NextRequest) {
  try {
    const body: CompileRequest = await req.json();

    if (!body.image) {
      return NextResponse.json(
        { error: "Image data is required" },
        { status: 400 }
      );
    }

    // Resolve API Key according to contract rules
    let apiKey: string | undefined;
    if (body.apiKeyType === "custom" && body.customApiKey) {
      apiKey = body.customApiKey;
    } else if (body.apiKeyType === "default_1") {
      apiKey = process.env.GEMINI_KEY_1;
    } else if (body.apiKeyType === "default_2") {
      apiKey = process.env.GEMINI_KEY_2;
    } else if (body.customApiKey) {
      apiKey = body.customApiKey;
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

    // Extract base64 image data and mime type
    const match = body.image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    const mimeType = match ? match[1] : "image/png";
    const base64Data = match ? match[2] : body.image;

    // Initialize Google GenAI client
    const ai = new GoogleGenAI({ apiKey });
    const modelName = process.env.GEMMA_MODEL || "gemma-4-31b-it";

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

    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
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
      ],
    });

    const responseText = response.text || "";

    // Sanitize response: strip markdown backticks if returned
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.slice(7);
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.slice(3);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.slice(0, -3);
    }
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);
    const validated = CompileOutputSchema.parse(parsed);

    const result: CompileResponse = {
      componentName: validated.componentName,
      html: validated.html,
      props: validated.props,
    };

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Compilation error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to compile wireframe" },
      { status: 500 }
    );
  }
}
