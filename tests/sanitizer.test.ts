import { describe, it, expect } from "vitest";
import { sanitizeHtml } from "../lib/sanitizer";

describe("sanitizeHtml: blocks", () => {
  it("svg onload with no space", () => {
    expect(sanitizeHtml("<svg/onload=alert(1)>")).not.toMatch(/onload/i);
  });
  it("self-closing and unclosed script", () => {
    expect(sanitizeHtml("<p>a</p><script/>")).not.toMatch(/<\s*script/i);
    expect(sanitizeHtml("<p>a</p><script src=x>")).not.toMatch(/<\s*script/i);
  });
  it("split-tag trick", () => {
    expect(sanitizeHtml("<scr<script>ipt>alert(1)</scr</script>ipt>")).not.toMatch(/<\s*script/i);
  });
  it("iframe, object, embed, base, meta, link", () => {
    const out = sanitizeHtml(
      '<iframe src="https://x"></iframe><object data="x"></object><embed src="x">' +
        '<base href="https://x"><meta http-equiv="refresh" content="0"><link rel="stylesheet" href="x">',
    );
    expect(out).not.toMatch(/<\s*(iframe|object|embed|base|meta|link)/i);
  });
  it("inline handlers", () => {
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).not.toMatch(/onerror/i);
    expect(sanitizeHtml('<div onmouseover="x()">a</div>')).not.toMatch(/onmouseover/i);
  });
  it("style attribute and style tag", () => {
    expect(sanitizeHtml('<div style="background:url(javascript:alert(1))">a</div>')).not.toMatch(/style=/i);
    expect(sanitizeHtml("<style>@import 'x';</style><p>a</p>")).not.toMatch(/<\s*style/i);
  });
  it("javascript: URL variants", () => {
    for (const href of [" javascript:alert(1)", "JaVaScRiPt:alert(1)", "java&#x09;script:alert(1)", "&#106;avascript:alert(1)"]) {
      const out = sanitizeHtml(`<a href="${href}">x</a>`);
      expect(out).not.toMatch(/javascript:/i);
      expect(out).not.toMatch(/java\s*script/i);
    }
  });
  it("svg data image", () => {
    expect(sanitizeHtml('<img src="data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=">')).not.toMatch(/svg\+xml/i);
  });
  it("form action", () => {
    expect(sanitizeHtml('<form action="https://evil.example" method="post"><input name="a"></form>')).not.toMatch(/action=/i);
  });
});

describe("sanitizeHtml: keeps", () => {
  it("css classes and component structure", () => {
    const out = sanitizeHtml('<div class="p-4 md:flex hover:bg-blue-500"><button type="button">Go</button></div>');
    expect(out).toContain('class="p-4 md:flex hover:bg-blue-500"');
    expect(out).toContain("<button");
  });
  it("inline svg", () => {
    const out = sanitizeHtml('<svg viewBox="0 0 24 24" fill="none"><path d="M0 0L10 10" stroke="currentColor"/></svg>');
    expect(out).toMatch(/viewbox/i);
    expect(out).toContain('d="M0 0L10 10"');
  });
  it("safe links and png data images", () => {
    expect(sanitizeHtml('<a href="https://example.com">x</a>')).toContain('href="https://example.com"');
    expect(sanitizeHtml('<img src="data:image/png;base64,iVBORw0KGgo=">')).toContain("data:image/png");
  });
});