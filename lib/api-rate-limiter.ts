/**
 * Generic API-key sliding-window rate limiter.
 *
 * Used for both Gemini (29 RPM) and NVIDIA NIM (39 RPM).
 *
 * Atomic check-and-record via `takeApiSlot`: a request either takes a slot or
 * is rejected, preventing the TOCTOU race of separate check/record calls.
 *
 * In-memory only — each serverless instance keeps its own counts.
 * This is a best-effort guard, not a hard guarantee across instances.
 */

const WINDOW_MS = 60_000;
const MAX_TRACKED_KEYS = 2_000;

const windows = new Map<string, number[]>();

export interface RateLimitSlot {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Derive a short, collision-safe identifier from a provider tag and API key.
 * The provider prefix prevents two keys on different providers with the same
 * suffix from sharing a bucket.
 */
export function keyId(provider: string, apiKey: string): string {
  const suffix = apiKey.trim().slice(-16) || "default";
  return `${provider}:${suffix}`;
}

/**
 * Atomically checks the sliding window and, if allowed, records the request.
 */
export function takeApiSlot(
  id: string,
  maxRpm: number,
  now: number = Date.now(),
): RateLimitSlot {
  const boundary = now - WINDOW_MS;
  const active = (windows.get(id) ?? []).filter((t) => t > boundary);

  if (active.length >= maxRpm) {
    windows.set(id, active);
    const oldest = active[0];
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000));
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  active.push(now);
  windows.set(id, active);

  if (windows.size > MAX_TRACKED_KEYS) sweep(now);

  return { allowed: true, remaining: maxRpm - active.length, retryAfterSeconds: 0 };
}

/** Drop keys whose timestamps have all expired out of the window. */
function sweep(now: number) {
  const boundary = now - WINDOW_MS;
  for (const [key, timestamps] of windows) {
    if (timestamps.every((t) => t <= boundary)) windows.delete(key);
  }
}
