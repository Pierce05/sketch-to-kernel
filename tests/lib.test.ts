import { describe, it, expect } from "vitest";
import { extractFencedJson } from "@/lib/json-extractor";
import { sanitizeHtml } from "@/lib/sanitizer";
import { CompileRequestSchema, CompileOutputSchema } from "@/lib/schemas";

describe("extractFencedJson", () => {
  it("parses plain JSON", () => {
    expect(extractFencedJson<{ a: number }>('{"a":1}')).toEqual({ a: 1 });
  });
  it("parses JSON inside a markdown fence", () => {
    expect(extractFencedJson<{ a: number }>('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });
  it("parses JSON surrounded by stray text", () => {
    expect(extractFencedJson<{ a: number }>('Here you go: {"a":1} done')).toEqual({ a: 1 });
  });
  it("throws when there is no JSON", () => {
    expect(() => extractFencedJson("no json here")).toThrow();
  });
});

describe("sanitizeHtml", () => {
  it("removes script tags", () => {
    expect(sanitizeHtml('<div>hi</div><script>alert(1)</script>')).not.toMatch(/<script/i);
  });
  it("removes inline event handlers", () => {
    expect(sanitizeHtml('<button onclick="x()">go</button>')).not.toMatch(/onclick/i);
  });
  it("removes javascript: URLs", () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toMatch(/javascript:/i);
  });
  it("keeps safe markup", () => {
    expect(sanitizeHtml('<div class="p-4">hello</div>')).toContain('class="p-4"');
  });
});

describe("CompileRequestSchema", () => {
  it("accepts a valid request", () => {
    const r = CompileRequestSchema.safeParse({
      image: "data:image/png;base64,AAAA",
      apiKeyType: "default_1",
    });
    expect(r.success).toBe(true);
  });
  it("rejects an unknown key mode", () => {
    const r = CompileRequestSchema.safeParse({
      image: "data:image/png;base64,AAAA",
      apiKeyType: "nope",
    });
    expect(r.success).toBe(false);
  });
});

describe("CompileOutputSchema", () => {
  it("accepts a valid model output", () => {
    const r = CompileOutputSchema.safeParse({
      componentName: "Card",
      html: "<div></div>",
      props: [{ name: "title", type: "string", default: "Hi", description: "Title" }],
    });
    expect(r.success).toBe(true);
  });
  it("rejects output with no html", () => {
    expect(CompileOutputSchema.safeParse({ componentName: "Card", props: [] }).success).toBe(false);
  });
});
