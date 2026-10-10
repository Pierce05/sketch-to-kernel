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
