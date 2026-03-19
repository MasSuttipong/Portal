import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { parseContentData } from "@/lib/content-validation";
import {
  ALLOWED_FILES,
  isValidFilename,
  type ContentFilename,
} from "@/lib/content-registry";

const CONTENT_DIR = join(process.cwd(), "content");

export function readContent<T>(filename: ContentFilename): T {
  const filePath = join(CONTENT_DIR, `${filename}.json`);
  const raw = readFileSync(filePath, "utf-8");
  return parseContentData(filename, JSON.parse(raw)) as T;
}

export function writeContent(filename: ContentFilename, data: unknown): void {
  const filePath = join(CONTENT_DIR, `${filename}.json`);
  const sanitized = parseContentData(filename, data);
  writeFileSync(filePath, JSON.stringify(sanitized, null, 2), "utf-8");
}

export { ALLOWED_FILES, isValidFilename };
export type { ContentFilename };
