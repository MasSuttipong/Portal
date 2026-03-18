/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const BASE_PATH_ENV_NAME = "NEXT_PUBLIC_BASE_PATH";
const BASE_PATH_SENTINEL = "/__RUNTIME_BASE_PATH__";
const BASE_PATH_MARKER_PATH = path.join(".next", "runtime-base-path.applied.json");

function normalizeBasePath(value) {
  const trimmed = value?.trim() ?? "";

  if (!trimmed || trimmed === "/") {
    return "";
  }

  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

function readValidatedBasePath(value = process.env[BASE_PATH_ENV_NAME]) {
  const normalized = normalizeBasePath(value);

  if (normalized === BASE_PATH_SENTINEL) {
    throw new Error(
      `Invalid environment variable ${BASE_PATH_ENV_NAME}. ` +
        `The reserved value "${BASE_PATH_SENTINEL}" cannot be used at runtime.`
    );
  }

  return normalized;
}

module.exports = {
  BASE_PATH_ENV_NAME,
  BASE_PATH_MARKER_PATH,
  BASE_PATH_SENTINEL,
  normalizeBasePath,
  readValidatedBasePath,
};
