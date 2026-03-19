import sanitizeHtml from "sanitize-html";

const CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;

export const DISPLAY_HTML_ALLOWED_TAGS = [
  "b",
  "strong",
  "i",
  "em",
  "u",
  "br",
  "p",
  "ul",
  "ol",
  "li",
] as const;

const DISPLAY_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [...DISPLAY_HTML_ALLOWED_TAGS],
  allowedAttributes: {},
  allowedSchemes: ["http", "https"],
  disallowedTagsMode: "discard",
  nonTextTags: ["script", "style", "textarea", "option", "noscript"],
  selfClosing: ["br"],
  parser: {
    lowerCaseTags: true,
  },
};

export function normalizeTextInput(value: string): string {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .replace(/\t/g, " ")
    .replace(CONTROL_CHAR_PATTERN, "")
    .trim();
}

export function sanitizePlainText(value: string): string {
  return sanitizeHtml(normalizeTextInput(value), {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "discard",
    nonTextTags: ["script", "style", "textarea", "option", "noscript"],
  }).replace(/\u00A0/g, " ");
}

export function sanitizeDisplayHtml(value: string): string {
  return sanitizeHtml(normalizeTextInput(value), DISPLAY_HTML_OPTIONS).trim();
}

export function hasVisibleText(value: string): boolean {
  return sanitizePlainText(value).length > 0;
}
