import { z } from "zod";

export const ApiKeyModeSchema = z.enum(["default_1", "default_2", "custom"]);
export const CustomProviderSchema = z.enum(["gemini", "nvidia", "custom"]);

export const CompileRequestSchema = z
  .object({
    image: z
      .string({ required_error: "image data URL is required" })
      .min(10, "image data URL must not be empty")
      .max(7_000_000, "image is too large; use a smaller sketch"),
    apiKeyType: ApiKeyModeSchema,
    customProvider: CustomProviderSchema.optional().default("gemini"),
    customApiKey: z.string().max(512).optional(),
    customModelId: z.string().max(200).optional(),
    customEndpoint: z.string().max(2000).optional(),
    enableThinking: z.boolean().optional().default(false),
    wireframeDescription: z.string().max(50000).optional(),
  })
  .refine(
    (data) => {
      if (data.apiKeyType === "custom") {
        return typeof data.customApiKey === "string" && data.customApiKey.trim().length > 0;
      }
      return true;
    },
    {
      message: "customApiKey is required when apiKeyType is 'custom'",
      path: ["customApiKey"],
    },
  )
  .refine(
    (data) => {
      if (data.apiKeyType === "custom" && data.customProvider === "custom") {
        return typeof data.customEndpoint === "string" && data.customEndpoint.trim().length > 0;
      }
      return true;
    },
    {
      message: "customEndpoint is required when customProvider is 'custom'",
      path: ["customEndpoint"],
    },
  );

export const ComponentPropSchema = z.object({
  name: z.string().min(1, "prop name is required"),
  type: z.string().default("string"),
  default: z.string().default(""),
  description: z.string().default(""),
});

export const CompileOutputSchema = z.object({
  componentName: z.string().min(1, "componentName is required"),
  html: z.string().min(1, "html content is required"),
  props: z.array(ComponentPropSchema).default([]),
  error: z.string().optional(),
});

export type CompileRequestInput = z.infer<typeof CompileRequestSchema>;
export type CompileOutput = z.infer<typeof CompileOutputSchema>;
