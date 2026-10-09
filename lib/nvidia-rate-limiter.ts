/**
 * NVIDIA NIM Sliding Window Rate Limiter
 * 
 * NVIDIA NIM enforces a strict quota of 39 Requests Per Minute (RPM) per API key
 * across all models. Upstream NVIDIA servers register any incoming request (including
 * failures, 4xx, and 5xx) as a consumed request against this 39 RPM limit.
 * 
 * To ensure we NEVER trigger an upstream HTTP 429 Too Many Requests penalty from NVIDIA,
 * this limiter maintains a sliding 60-second window of request timestamps per key.
 * If the 39th request is attempted before the oldest timestamp rolls out of the 60s
 * window, the limiter blocks the request BEFORE sending it to NVIDIA and calculates
 * the exact cooldown duration.
 */

const MAX_NVIDIA_RPM = 39;
const WINDOW_DURATION_MS = 60 * 1000; // 60,000 ms = 1 minute

// Keyed timestamp records in memory
const requestTimestampsByKey = new Map<string, number[]>();

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  totalInWindow: number;
  limit: number;
}

/**
 * Checks if a request can be dispatched under the 39 RPM limit.
 * Purges timestamps older than 60 seconds.
 */
export function checkNvidiaRateLimit(apiKey: string): RateLimitCheckResult {
  const now = Date.now();
  const windowBoundary = now - WINDOW_DURATION_MS;

  // Use the key's unique signature (or fallback)
  const keyIdentifier = apiKey.trim().slice(-16) || "default-nvidia-key";
  const existingTimestamps = requestTimestampsByKey.get(keyIdentifier) || [];

  // Retain only requests within the active 60-second sliding window
  const activeTimestamps = existingTimestamps.filter((ts) => ts > windowBoundary);
  requestTimestampsByKey.set(keyIdentifier, activeTimestamps);

  if (activeTimestamps.length >= MAX_NVIDIA_RPM) {
    const oldestTimestamp = activeTimestamps[0];
    const msUntilExpiry = oldestTimestamp + WINDOW_DURATION_MS - now;
    const retryAfterSeconds = Math.max(1, Math.ceil(msUntilExpiry / 1000));

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
      totalInWindow: activeTimestamps.length,
      limit: MAX_NVIDIA_RPM,
    };
  }

  return {
    allowed: true,
    remaining: MAX_NVIDIA_RPM - activeTimestamps.length,
    retryAfterSeconds: 0,
    totalInWindow: activeTimestamps.length,
    limit: MAX_NVIDIA_RPM,
  };
}

/**
 * Records a dispatched request timestamp into the sliding window.
 * MUST be called before/when an attempt is made, as NVIDIA counts all attempts.
 */
export function recordNvidiaRequest(apiKey: string): void {
  const now = Date.now();
  const windowBoundary = now - WINDOW_DURATION_MS;
  const keyIdentifier = apiKey.trim().slice(-16) || "default-nvidia-key";

  const existingTimestamps = requestTimestampsByKey.get(keyIdentifier) || [];
  const activeTimestamps = existingTimestamps.filter((ts) => ts > windowBoundary);
  activeTimestamps.push(now);

  requestTimestampsByKey.set(keyIdentifier, activeTimestamps);
}
