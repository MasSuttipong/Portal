import { z } from "zod";
import { formatZodIssues } from "@/lib/content-validation";
import { sanitizePlainText } from "@/lib/html-sanitizer";

const CREDENTIAL_CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/;
const PROVIDER_CODE_PATTERN = /^[A-Za-z0-9_-]+$/;

function credentialStringSchema(fieldName: string) {
  return z.string().superRefine((value, ctx) => {
    if (value.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: `${fieldName} is required.`,
      });
      return;
    }

    if (value.length > 512) {
      ctx.addIssue({
        code: "custom",
        message: `${fieldName} must be 512 characters or fewer.`,
      });
    }

    if (CREDENTIAL_CONTROL_CHAR_PATTERN.test(value)) {
      ctx.addIssue({
        code: "custom",
        message: `${fieldName} contains unsupported control characters.`,
      });
    }
  });
}

const adminLoginSchema = z.object({
  password: credentialStringSchema("password"),
});

const providerLoginSchema = z.object({
  providerCode: z.preprocess(
    (value) => (typeof value === "string" ? sanitizePlainText(value) : value),
    z.string().min(1, "providerCode is required.").max(64, "providerCode must be 64 characters or fewer.").regex(PROVIDER_CODE_PATTERN, "providerCode contains unsupported characters.")
  ),
  apiKey: credentialStringSchema("apiKey"),
});

export class RequestValidationError extends Error {
  issues: string[];

  constructor(issues: string[]) {
    super("Request validation failed.");
    this.name = "RequestValidationError";
    this.issues = issues;
  }
}

export function parseAdminLoginBody(data: unknown) {
  const result = adminLoginSchema.safeParse(data);

  if (!result.success) {
    throw new RequestValidationError(formatZodIssues(result.error));
  }

  return result.data;
}

export function parseProviderLoginBody(data: unknown) {
  const result = providerLoginSchema.safeParse(data);

  if (!result.success) {
    throw new RequestValidationError(formatZodIssues(result.error));
  }

  return result.data;
}
