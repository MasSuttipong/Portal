const MAX_URL_LENGTH = 2048;
const PATH_TRAVERSAL_PATTERN = /(^|\/)\.\.(\/|$)/;

export type UrlPolicyOptions = {
  allowRootRelative?: boolean;
  requireAbsolute?: boolean;
};

function splitPathFromSuffix(value: string): string {
  const queryIndex = value.search(/[?#]/);
  return queryIndex >= 0 ? value.slice(0, queryIndex) : value;
}

function hasUnsafePathSegments(path: string): boolean {
  if (path.includes("\\")) {
    return true;
  }

  return PATH_TRAVERSAL_PATTERN.test(path);
}

function normalizeRootRelativePath(value: string): string | null {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  const pathOnly = splitPathFromSuffix(value);

  if (hasUnsafePathSegments(pathOnly)) {
    return null;
  }

  try {
    const parsed = new URL(value, "https://example.com");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

function normalizeAbsoluteHttpUrl(value: string): string | null {
  try {
    const parsed = new URL(value);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    const pathOnly = splitPathFromSuffix(`${parsed.pathname}${parsed.search}${parsed.hash}`);

    if (hasUnsafePathSegments(pathOnly)) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

export function normalizeAllowedUrl(
  value: string,
  options: UrlPolicyOptions = {}
): string | null {
  const trimmed = value.trim();

  if (!trimmed || trimmed.length > MAX_URL_LENGTH) {
    return null;
  }

  if (trimmed.startsWith("/")) {
    if (options.requireAbsolute) {
      return null;
    }

    return options.allowRootRelative === false
      ? null
      : normalizeRootRelativePath(trimmed);
  }

  return normalizeAbsoluteHttpUrl(trimmed);
}

export function isAllowedUrl(
  value: string,
  options: UrlPolicyOptions = {}
): boolean {
  return normalizeAllowedUrl(value, options) !== null;
}
