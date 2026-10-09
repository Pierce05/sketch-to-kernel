const WINDOW_MS = 60_000;
const MAX_TRACKED_IPS = 5_000;

const hits = new Map<string, number[]>();

export interface IpSlot {
  allowed: boolean;
  retryAfterSeconds: number;
}

/**
 * Sliding-window limiter, per client IP. Checking and recording happen in one
 * call, so two concurrent requests cannot both slip past the check.
 * In-memory only: on serverless hosting each instance keeps its own counts,
 * so this is a guard against spam, not a hard guarantee.
 */
export function takeIpSlot(
  ip: string,
  limit: number,
  now: number = Date.now(),
  windowMs: number = WINDOW_MS,
): IpSlot {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= limit) {
    hits.set(ip, recent);
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((recent[0] + windowMs - now) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  }

  recent.push(now);
  hits.set(ip, recent);

  if (hits.size > MAX_TRACKED_IPS) sweep(now, windowMs);
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Drop IPs with no requests inside the window, so the map cannot grow forever. */
function sweep(now: number, windowMs: number) {
  for (const [ip, times] of hits) {
    if (times.every((t) => now - t >= windowMs)) hits.delete(ip);
  }
}

export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/** Test helper: forget all counts. */
export function resetIpLimiter() {
  hits.clear();
}