/**
 * HTML Sanitizer
 * Strips script tags, inline event handlers (onclick, onerror, etc.),
 * and javascript: URLs to ensure safe live rendering in the sandbox.
 */
export function sanitizeHtml(rawHtml: string): string {
  if (!rawHtml) return "";

  let sanitized = rawHtml;

  // 1. Remove <script> tags and any contents inside them
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

  // 2. Remove inline event handlers (e.g. onclick="...", onerror='...', onload=...)
  sanitized = sanitized.replace(/\s+on[a-z]+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "");

  // 3. Remove javascript: pseudo-protocols in href, src, formaction, etc.
  sanitized = sanitized.replace(/(href|src|action|formaction)\s*=\s*["']\s*javascript:[^"']*["']/gi, '$1="#"');
  sanitized = sanitized.replace(/(href|src|action|formaction)\s*=\s*javascript:[^\s>]+/gi, '$1="#"');

  // 4. Remove data: URLs containing executable content (e.g. data:text/html)
  sanitized = sanitized.replace(/(href|src)\s*=\s*["']\s*data:text\/html[^"']*["']/gi, '$1="#"');

  return sanitized;
}
