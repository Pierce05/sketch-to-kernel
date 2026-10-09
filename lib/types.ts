export type ApiKeyMode = "default_1" | "default_2" | "custom";

export interface CompileRequest {
  image: string; // Base64 data URL
  apiKeyType: ApiKeyMode;
  customApiKey?: string;
}

export interface ComponentProp {
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface CompileResponse {
  componentName: string;
  html: string;
  props: ComponentProp[];
  error?: string;
}
