import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORAGE_CUSTOM_KEY = "sketch_custom_key";
export const STORAGE_KEY_MODE = "sketch_api_key_mode";
