function normalizeBasePath(value: string | undefined): string {
  const trimmed = value?.trim() ?? "";

  if (!trimmed || trimmed === "/") {
    return "";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

const EXTERNAL_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:|\/\/)/i;

export const BASE_PATH = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH);

export function isExternalUrl(path: string): boolean {
  return EXTERNAL_URL_PATTERN.test(path);
}

export function withBasePath(path: string): string {
  if (!path || isExternalUrl(path) || path.startsWith("#")) {
    return path;
  }

  if (!BASE_PATH) {
    return path;
  }

  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) {
    return path;
  }

  if (path === "/") {
    return BASE_PATH;
  }

  return path.startsWith("/") ? `${BASE_PATH}${path}` : path;
}

export function stripBasePath(pathname: string): string {
  if (!pathname) {
    return "/";
  }

  if (!BASE_PATH) {
    return pathname;
  }

  if (pathname === BASE_PATH) {
    return "/";
  }

  return pathname.startsWith(`${BASE_PATH}/`)
    ? pathname.slice(BASE_PATH.length) || "/"
    : pathname;
}

export function withBasePathApi(path: string): string {
  return withBasePath(path);
}
