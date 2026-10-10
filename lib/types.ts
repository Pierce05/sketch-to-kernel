export type ApiKeyMode = "default_1" | "default_2" | "custom";
export type CustomProvider = "gemini" | "nvidia";

export interface CompileRequest {
  image: string; // Base64 data URL, e.g. "data:image/png;base64,..."
  apiKeyType: ApiKeyMode;
  customProvider?: CustomProvider; // "gemini" | "nvidia"
  customApiKey?: string; // Sent when apiKeyType === "custom"
  customModelId?: string; // Sent for NVIDIA NIM custom model
  wireframeDescription?: string; // Semantic wireframe element layout description
}

export interface ComponentProp {
  name: string; // e.g. "title", "variant"
  type: string; // e.g. "string", "'sm' | 'md' | 'lg'"
  default: string; // e.g. "Get Started"
  description: string;
}

// Runtime validation is defined in schemas.ts (Zod). Keep these interfaces in sync.
export interface CompileResponse {
  componentName: string; // e.g. "PricingCard"
  html: string; // Self-contained Tailwind HTML markup
  props: ComponentProp[];
  error?: string;
}
