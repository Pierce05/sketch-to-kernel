import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORAGE_CUSTOM_KEY = "sketch_custom_key";
export const STORAGE_KEY_MODE = "sketch_api_key_mode";
export const STORAGE_CUSTOM_PROVIDER = "sketch_custom_provider";
export const STORAGE_CUSTOM_MODEL = "sketch_custom_model";
export const STORAGE_CUSTOM_ENDPOINT = "sketch_custom_endpoint";
export const STORAGE_CUSTOM_THINKING = "sketch_custom_thinking";

// Per-provider separate keys and models
export const STORAGE_CUSTOM_KEY_GEMINI = "sketch_custom_key_gemini";
export const STORAGE_CUSTOM_KEY_NVIDIA = "sketch_custom_key_nvidia";
export const STORAGE_CUSTOM_KEY_ENDPOINT = "sketch_custom_key_endpoint";
export const STORAGE_CUSTOM_MODEL_NVIDIA = "sketch_custom_model_nvidia";
export const STORAGE_CUSTOM_MODEL_ENDPOINT = "sketch_custom_model_endpoint";

// NIM extra_body toggles (disabled by default so models that reject extra_body succeed)
export const STORAGE_NIM_EXTRA_BODY = "sketch_nim_extra_body";
export const STORAGE_CUSTOM_EXTRA_BODY_NVIDIA = "sketch_custom_extra_body_nvidia";

/**
 * Checks whether an endpoint URL points to a local or private network address
 * (e.g., localhost, 127.0.0.1, 0.0.0.0, 192.168.*, 10.*).
 */
export function isLocalhostEndpoint(urlStr?: string): boolean {
  if (!urlStr || typeof urlStr !== "string") return false;
  const trimmed = urlStr.trim();
  if (!trimmed) return false;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
    const parsed = new URL(withProto);
    const host = parsed.hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "[::1]" ||
      host.endsWith(".local") ||
      host.startsWith("192.168.") ||
      host.startsWith("10.") ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
    );
  } catch {
    return false;
  }
}
