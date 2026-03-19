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
