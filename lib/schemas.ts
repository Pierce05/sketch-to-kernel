import { z } from "zod";

export const ApiKeyModeSchema = z.enum(["default_1", "default_2", "custom"]);
export const CustomProviderSchema = z.enum(["gemini", "nvidia"]);

export const CompileRequestSchema = z.object({
  image: z
    .string({ required_error: "image data URL is required" })
    .min(10, "image data URL must not be empty"),
  apiKeyType: ApiKeyModeSchema,
  customProvider: CustomProviderSchema.optional().default("gemini"),
  customApiKey: z.string().optional(),
  customModelId: z.string().optional(),
  wireframeDescription: z.string().optional(),
});

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
