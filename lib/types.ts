export type ApiKeyMode = "default_1" | "default_2" | "custom";

export interface CompileRequest {
  image: string; // Base64 data URL, e.g. "data:image/png;base64,..."
  apiKeyType: ApiKeyMode;
  customApiKey?: string; // Sent only when apiKeyType === "custom"
}

export interface ComponentProp {
  name: string; // e.g. "title", "variant"
  type: string; // e.g. "string", "'sm' | 'md' | 'lg'"
  default: string; // e.g. "Get Started"
  description: string;
}

export interface CompileResponse {
  componentName: string; // e.g. "PricingCard"
  html: string; // Self-contained Tailwind HTML markup
  props: ComponentProp[];
  error?: string;
}
