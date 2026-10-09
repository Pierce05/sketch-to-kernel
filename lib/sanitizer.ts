
import sanitize from "sanitize-html";

// Only allow base64-encoded raster images. SVG data URLs are blocked.
const SAFE_DATA_IMG =
  /^data:image\/(?:png|jpeg|jpg|gif|webp);base64,[a-z0-9+/]+=*$/i;

const HTML_TAGS = [
  "a", "abbr", "address", "article", "aside", "b", "blockquote", "br", "button",
  "caption", "cite", "code", "col", "colgroup", "dd", "del", "details", "div", "dl",
  "dt", "em", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3",
  "h4", "h5", "h6", "header", "hr", "i", "img", "input", "ins", "kbd", "label",
  "legend", "li", "main", "mark", "nav", "ol", "optgroup", "option", "p", "pre",
  "progress", "q", "s", "samp", "section", "select", "small", "span", "strong", "sub",
  "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time",
  "tr", "u", "ul",
];

const SVG_TAGS = [
  "svg", "g", "path", "circle", "ellipse", "rect", "line", "polyline", "polygon",
  "defs", "lineargradient", "radialgradient", "stop",
];

const SVG_PAINT = [
  "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin", "fill-rule",
  "clip-rule", "opacity", "fill-opacity", "stroke-opacity", "transform",
];

const OPTIONS: sanitize.IOptions = {
  allowedTags: [...HTML_TAGS, ...SVG_TAGS],

  allowedAttributes: {
    "*": [
      "class", "id", "role", "lang", "dir", "title", "tabindex",
      "aria-label", "aria-hidden", "aria-expanded", "aria-describedby", "aria-labelledby",
    ],
    a: ["href", "target", "rel"],
    img: ["src", "alt", "width", "height", "loading"],
    input: [
      "type", "name", "value", "placeholder", "checked", "disabled", "required",
      "min", "max", "step", "maxlength", "readonly",
    ],
    label: ["for"],
    button: ["type", "disabled", "name", "value"],
    select: ["name", "disabled", "required", "multiple"],
    option: ["value", "selected", "disabled"],
    optgroup: ["label", "disabled"],
    textarea: [
      "name", "rows", "cols", "placeholder", "disabled", "required",
      "readonly", "maxlength",
    ],
    td: ["colspan", "rowspan"],
    th: ["colspan", "rowspan", "scope"],
    col: ["span"],
    colgroup: ["span"],
    progress: ["value", "max"],
    // Forms have no allowed action or method attributes.
    svg: [
      "viewbox", "viewBox", "width", "height", "xmlns", "preserveaspectratio",
      ...SVG_PAINT,
    ],
    g: SVG_PAINT,
    path: ["d", ...SVG_PAINT],
    circle: ["cx", "cy", "r", ...SVG_PAINT],
    ellipse: ["cx", "cy", "rx", "ry", ...SVG_PAINT],
    rect: ["x", "y", "width", "height", "rx", "ry", ...SVG_PAINT],
    line: ["x1", "y1", "x2", "y2", ...SVG_PAINT],
    polyline: ["points", ...SVG_PAINT],
    polygon: ["points", ...SVG_PAINT],
    lineargradient: [
      "x1", "y1", "x2", "y2", "gradientunits", "gradienttransform",
    ],
    radialgradient: ["cx", "cy", "r", "fx", "fy", "gradientunits"],
    stop: ["offset", "stop-color", "stop-opacity"],
  },

  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["http", "https", "data"],
  },
  allowProtocolRelative: false,

  // Drop the contents of these elements entirely.
  nonTextTags: ["script", "style", "noscript"],

  transformTags: {
    a: (tagName, attribs) => {
      const next: Record<string, string> = { ...attribs };

      if (next.target !== "_blank" && next.target !== "_self") {
        delete next.target;
      }

      if (next.target === "_blank") {
        next.rel = "noopener noreferrer";
      }

      return { tagName, attribs: next };
    },
  },

  // Validate data image URLs after parsing and before returning sanitized HTML.
  exclusiveFilter: (frame) => {
    if (frame.tag === "img") {
      const src = (frame.attribs.src ?? "").trim();

      if (/^data:/i.test(src) && !SAFE_DATA_IMG.test(src)) {
        return true;
      }
    }

    return false;
  },
};

/**
 * Allowlist sanitizer for model-generated HTML.
 * The preview iframe remains sandboxed as an additional security layer.
 */
export function sanitizeHtml(html: string): string {
  return sanitize(html, OPTIONS);
}
