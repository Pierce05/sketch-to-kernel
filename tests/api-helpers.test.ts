import { describe, it, expect, beforeEach } from "vitest";
import { readSseStream } from "../lib/sse";
import { takeIpSlot, getClientIp, resetIpLimiter } from "../lib/ip-rate-limit";

const enc = new TextEncoder();
const streamOf = (chunks: Uint8Array[]) =>
  new ReadableStream<Uint8Array>({
    start(c) {
      for (const ch of chunks) c.enqueue(ch);
      c.close();
    },
  });
const ev = (o: unknown) => `data: ${JSON.stringify(o)}\n\n`;
const bytes = enc.encode(
  ev({ choices: [{ delta: { content: "Héllo " } }] }) +
    ev({ choices: [{ delta: { reasoning_content: "think " } }] }) +
    ev({ choices: [{ delta: { content: "wörld 🚀" } }] }) +
    "data: [DONE]\n\n",
);

describe("readSseStream", () => {
  it("gives the same text for every two-chunk split", async () => {
    for (let i = 0; i <= bytes.length; i++) {
      const r = await readSseStream(streamOf([bytes.slice(0, i), bytes.slice(i)]));
      expect(r.content).toBe("Héllo wörld 🚀");
      expect(r.reasoning).toBe("think ");
    }
  });
  it("handles CRLF and a missing final newline", async () => {
    const raw = enc.encode(
      `data: ${JSON.stringify({ choices: [{ delta: { content: "a" } }] })}\r\n\r\n` +
        `data: ${JSON.stringify({ choices: [{ delta: { content: "b" } }] })}`,
    );
    expect((await readSseStream(streamOf([raw]))).content).toBe("ab");
  });
});

describe("takeIpSlot", () => {
  beforeEach(() => resetIpLimiter());
  it("allows the limit, then blocks", () => {
    for (let i = 0; i < 3; i++) expect(takeIpSlot("1.1.1.1", 3, 1000 + i).allowed).toBe(true);
    const blocked = takeIpSlot("1.1.1.1", 3, 1010);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });
  it("tracks IPs separately and recovers after the window", () => {
    for (let i = 0; i < 3; i++) takeIpSlot("1.1.1.1", 3, 1000);
    expect(takeIpSlot("2.2.2.2", 3, 1010).allowed).toBe(true);
    expect(takeIpSlot("1.1.1.1", 3, 61_001).allowed).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers the first forwarded address", () => {
    expect(getClientIp(new Headers({ "x-forwarded-for": "9.9.9.9, 10.0.0.1" }))).toBe("9.9.9.9");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

describe("api-rate-limiter (takeApiSlot & keyId)", () => {
  it("formats keyId with provider prefix", async () => {
    const { keyId } = await import("../lib/api-rate-limiter");
    expect(keyId("gemini", "AIzaSyD1234567890123456")).toBe("gemini:1234567890123456");
    expect(keyId("nvidia", "nvapi-1234567890123456")).toBe("nvidia:1234567890123456");
  });

  it("enforces rate limits atomically and calculates retry cooldown", async () => {
    const { takeApiSlot } = await import("../lib/api-rate-limiter");
    const testKey = "test-provider:unique-unit-test-key";
    const baseTime = 100_000;

    // Allow up to limit (e.g. 3 RPM)
    expect(takeApiSlot(testKey, 3, baseTime).allowed).toBe(true);
    expect(takeApiSlot(testKey, 3, baseTime + 1000).allowed).toBe(true);
    expect(takeApiSlot(testKey, 3, baseTime + 2000).allowed).toBe(true);

    // 4th request within 60s window should be blocked
    const blocked = takeApiSlot(testKey, 3, baseTime + 3000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);

    // After 60s passes from first request, slot should free up
    const afterWindow = takeApiSlot(testKey, 3, baseTime + 61_000);
    expect(afterWindow.allowed).toBe(true);
  });
});

describe("normalizeEndpointUrl", () => {
  it("preserves full chat/completions endpoints", async () => {
    const { normalizeEndpointUrl } = await import("../lib/custom-endpoint");
    expect(
      normalizeEndpointUrl("https://api.openai.com/v1/chat/completions")
    ).toBe("https://api.openai.com/v1/chat/completions");
    expect(
      normalizeEndpointUrl("https://api.openai.com/v1/chat/completions///")
    ).toBe("https://api.openai.com/v1/chat/completions");
  });

  it("appends chat/completions to /v1 endpoints", async () => {
    const { normalizeEndpointUrl } = await import("../lib/custom-endpoint");
    expect(normalizeEndpointUrl("https://api.openai.com/v1")).toBe(
      "https://api.openai.com/v1/chat/completions"
    );
    expect(normalizeEndpointUrl("http://localhost:11434/v1/")).toBe(
      "http://localhost:11434/v1/chat/completions"
    );
  });

  it("appends /v1/chat/completions to root domain endpoints", async () => {
    const { normalizeEndpointUrl } = await import("../lib/custom-endpoint");
    expect(normalizeEndpointUrl("http://localhost:11434")).toBe(
      "http://localhost:11434/v1/chat/completions"
    );
    expect(normalizeEndpointUrl("https://custom-ai.internal")).toBe(
      "https://custom-ai.internal/v1/chat/completions"
    );
  });

  it("handles empty or whitespace strings", async () => {
    const { normalizeEndpointUrl } = await import("../lib/custom-endpoint");
    expect(normalizeEndpointUrl("")).toBe("");
    expect(normalizeEndpointUrl("   ")).toBe("");
  });
});