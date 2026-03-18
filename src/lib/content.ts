import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const CONTENT_DIR = join(process.cwd(), "content");

export const ALLOWED_FILES = [
  "settings",
  "manual",
  "news",
  "tpacare-check",
  "insurance-companies",
  "self-insured",
  "international-insurance",
  "deductible",
  "provider-permissions",
] as const;

export type ContentFilename = (typeof ALLOWED_FILES)[number];

export function isValidFilename(filename: string): filename is ContentFilename {
  return (ALLOWED_FILES as readonly string[]).includes(filename);
}

export function readContent<T>(filename: ContentFilename): T {
  const filePath = join(CONTENT_DIR, `${filename}.json`);
  const raw = readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function writeContent(filename: ContentFilename, data: unknown): void {
  const filePath = join(CONTENT_DIR, `${filename}.json`);
  writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
