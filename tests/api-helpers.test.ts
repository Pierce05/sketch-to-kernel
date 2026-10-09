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