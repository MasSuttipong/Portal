import { readFileSync } from "fs";
import { join } from "path";
import { z, ZodError } from "zod";
import type { ContentFilename } from "@/lib/content-registry";
import {
  hasVisibleText,
  sanitizeDisplayHtml,
  sanitizePlainText,
} from "@/lib/html-sanitizer";
import { normalizeAllowedUrl } from "@/lib/url-policy";

const CONTENT_DIR = join(process.cwd(), "content");
const COMPANY_SECTION_FILENAMES = [
  "insurance-companies",
  "self-insured",
  "international-insurance",
  "deductible",
] as const;
const ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const CREDENTIAL_CONTROL_CHAR_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/;

type TextOptions = {
  maxLength: number;
  allowEmpty?: boolean;
  pattern?: RegExp;
};

type UrlOptions = {
  allowRootRelative?: boolean;
  requireAbsolute?: boolean;
};

function validatePlainText(
  value: string,
  ctx: z.RefinementCtx,
  options: TextOptions
) {
  if (!options.allowEmpty && value.length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "Text value cannot be empty.",
    });
    return z.NEVER;
  }

  if (value.length > options.maxLength) {
    ctx.addIssue({
      code: "custom",
      message: `Text value must be ${options.maxLength} characters or fewer.`,
    });
    return z.NEVER;
  }

  if (options.pattern && value.length > 0 && !options.pattern.test(value)) {
    ctx.addIssue({
      code: "custom",
      message: "Text value contains unsupported characters.",
    });
    return z.NEVER;
  }

  return value;
}

function validateDisplayHtml(
  value: string,
  ctx: z.RefinementCtx,
  options: TextOptions
) {
  const visibleText = sanitizePlainText(value);

  if (!options.allowEmpty && visibleText.length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "Rich text value cannot be empty.",
    });
    return z.NEVER;
  }

  if (visibleText.length > options.maxLength) {
    ctx.addIssue({
      code: "custom",
      message: `Rich text value must be ${options.maxLength} visible characters or fewer.`,
    });
    return z.NEVER;
  }

  return value;
}

function validateCredentialString(
  value: string,
  ctx: z.RefinementCtx,
  maxLength: number
) {
  if (value.length === 0) {
    ctx.addIssue({
      code: "custom",
      message: "Credential value cannot be empty.",
    });
    return z.NEVER;
  }

  if (value.length > maxLength) {
    ctx.addIssue({
      code: "custom",
      message: `Credential value must be ${maxLength} characters or fewer.`,
    });
    return z.NEVER;
  }

  if (CREDENTIAL_CONTROL_CHAR_PATTERN.test(value)) {
    ctx.addIssue({
      code: "custom",
      message: "Credential value contains unsupported control characters.",
    });
    return z.NEVER;
  }

  return value;
}

function validateUrlLike(
  value: string,
  ctx: z.RefinementCtx,
  options: UrlOptions
) {
  const normalized = normalizeAllowedUrl(value, options);

  if (!normalized) {
    ctx.addIssue({
      code: "custom",
      message: "URL/path must be an absolute http(s) URL or a safe root-relative path.",
    });
    return z.NEVER;
  }

  return normalized;
}

function requiredPlainText(options: TextOptions) {
  return z.preprocess(
    (value) => (typeof value === "string" ? sanitizePlainText(value) : value),
    z.string().transform((value, ctx) => validatePlainText(value, ctx, options))
  );
}

function nullablePlainText(options: TextOptions) {
  return z.preprocess((value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "string") {
      const sanitized = sanitizePlainText(value);
      return sanitized.length === 0 ? null : sanitized;
    }

    return value;
  }, z.union([
    z.null(),
    z.string().transform((value, ctx) => validatePlainText(value, ctx, options)),
  ]));
}

function requiredDisplayHtml(options: TextOptions) {
  return z.preprocess(
    (value) => (typeof value === "string" ? sanitizeDisplayHtml(value) : value),
    z.string().transform((value, ctx) => validateDisplayHtml(value, ctx, options))
  );
}

function nullableDisplayHtml(options: TextOptions) {
  return z.preprocess((value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "string") {
      const sanitized = sanitizeDisplayHtml(value);
      return hasVisibleText(sanitized) ? sanitized : null;
    }

    return value;
  }, z.union([
    z.null(),
    z.string().transform((value, ctx) => validateDisplayHtml(value, ctx, options)),
  ]));
}

function requiredUrl(options: UrlOptions) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value.trim() : value),
    z.string().transform((value, ctx) => validateUrlLike(value, ctx, options))
  );
}

function nullableUrl(options: UrlOptions) {
  return z.preprocess((value) => {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length === 0 ? null : trimmed;
    }

    return value;
  }, z.union([
    z.null(),
    z.string().transform((value, ctx) => validateUrlLike(value, ctx, options)),
  ]));
}

function optionalUrl(options: UrlOptions) {
  return z.preprocess((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed.length === 0 ? undefined : trimmed;
    }

    return value;
  }, z.union([
    z.undefined(),
    z.string().transform((value, ctx) => validateUrlLike(value, ctx, options)),
  ]));
}

function requiredCredential(maxLength: number) {
  return z.preprocess(
    (value) => (typeof value === "string" ? value.normalize("NFC") : value),
    z.string().transform((value, ctx) => validateCredentialString(value, ctx, maxLength))
  );
}

function requiredId(options: { allowEmpty?: boolean } = {}) {
  return requiredPlainText({
    maxLength: 64,
    allowEmpty: options.allowEmpty,
    pattern: ID_PATTERN,
  });
}

function nullableId() {
  return nullablePlainText({
    maxLength: 64,
    pattern: ID_PATTERN,
  });
}

function withUniqueArrayItems<T extends string>(
  values: T[]
): T[] {
  return Array.from(new Set(values));
}

function addUniqueKeyIssue(
  ctx: z.RefinementCtx,
  values: readonly string[],
  label: string
) {
  const seen = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      ctx.addIssue({
        code: "custom",
        message: `${label} must be unique.`,
      });
      return;
    }

    seen.add(value);
  }
}

function readRawContent(filename: ContentFilename): unknown {
  const filePath = join(CONTENT_DIR, `${filename}.json`);
  return JSON.parse(readFileSync(filePath, "utf-8")) as unknown;
}

const alertTypeSchema = z.enum([
  "warning",
  "error",
  "info",
  "success",
  "promo",
  "urgent",
]);

const alertSizeSchema = z.enum([
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
]);

const alertBorderSchema = z.enum([
  "none",
  "glow",
  "pulse",
  "shimmer",
  "bounce",
  "shake",
  "rainbow",
  "blink",
]);

const claimTypeSchema = z.enum([
  "OPD_IPD",
  "OPD_ONLY",
  "IPD_ONLY",
]);

const portalThemeSchema = z.enum([
  "default",
  "christmas",
  "newyear",
  "songkran",
  "valentine",
  "chinese-newyear",
  "halloween",
  "mothers-day",
  "fathers-day",
  "spring",
  "summer",
  "autumn",
  "winter",
  "party",
  "pride",
]);

const companySchema = z.object({
  id: requiredId(),
  displayName: requiredPlainText({ maxLength: 200 }),
  nameEn: nullablePlainText({ maxLength: 200 }),
  nameTh: nullablePlainText({ maxLength: 200 }),
  code: nullableId(),
  iclaimId: nullableId(),
  isClickable: z.boolean(),
  isNew: z.boolean(),
  claimType: claimTypeSchema,
  remark: nullableDisplayHtml({ maxLength: 2000 }),
  redirectUrl: optionalUrl({ allowRootRelative: true }),
  logoUrl: nullableUrl({ allowRootRelative: true }),
  alertText: nullableDisplayHtml({ maxLength: 2000 }),
  alertType: alertTypeSchema.optional(),
  alertSize: alertSizeSchema.optional(),
  alertGlow: z.boolean().optional(),
  alertBorder: alertBorderSchema.optional(),
});

const companyGroupSchema = z.object({
  id: requiredId(),
  headerName: requiredPlainText({ maxLength: 200 }),
  headerIconUrl: nullableUrl({ allowRootRelative: true }),
  companies: z.array(companySchema).max(500),
  alertText: nullableDisplayHtml({ maxLength: 2000 }),
  alertType: alertTypeSchema.optional(),
  alertSize: alertSizeSchema.optional(),
  alertGlow: z.boolean().optional(),
  alertBorder: alertBorderSchema.optional(),
});

const companySectionSchema = z.object({
  heading: requiredPlainText({ maxLength: 200, allowEmpty: true }),
  companies: z.array(companySchema).max(500),
  groups: z.array(companyGroupSchema).max(100).optional(),
  alertText: nullableDisplayHtml({ maxLength: 2000 }),
  alertType: alertTypeSchema.optional(),
  alertSize: alertSizeSchema.optional(),
  alertGlow: z.boolean().optional(),
  alertBorder: alertBorderSchema.optional(),
}).superRefine((section, ctx) => {
  const totalCompanies =
    section.companies.length +
    (section.groups?.reduce((sum, group) => sum + group.companies.length, 0) ?? 0);

  if (totalCompanies > 500) {
    ctx.addIssue({
      code: "custom",
      message: "Company sections may contain at most 500 companies in total.",
    });
  }
});

const newsItemSchema = z.object({
  id: requiredId(),
  title: requiredPlainText({ maxLength: 200 }),
  url: requiredUrl({ allowRootRelative: true }),
  isNew: z.boolean(),
  isPublished: z.boolean(),
});

const newsDataSchema = z.object({
  items: z.array(newsItemSchema).max(200),
}).superRefine((value, ctx) => {
  addUniqueKeyIssue(
    ctx,
    value.items.map((item) => item.id),
    "News item IDs"
  );
});

const manualItemSchema = z.object({
  id: requiredId(),
  title: requiredPlainText({ maxLength: 200 }),
  url: requiredUrl({ allowRootRelative: true }),
  isPublished: z.boolean(),
});

const manualDataSchema = z.object({
  subHeading: requiredDisplayHtml({ maxLength: 2000, allowEmpty: true }),
  items: z.array(manualItemSchema).max(200),
}).superRefine((value, ctx) => {
  addUniqueKeyIssue(
    ctx,
    value.items.map((item) => item.id),
    "Manual item IDs"
  );
});

const portalSettingsSchema = z.object({
  logo: z.object({
    url: requiredUrl({ allowRootRelative: true }),
    alt: requiredPlainText({ maxLength: 200, allowEmpty: true }),
  }),
  iclaim: z.object({
    baseUrl: requiredUrl({ requireAbsolute: true }),
    confirmText: requiredPlainText({ maxLength: 200, allowEmpty: true }),
    confirmOk: requiredPlainText({ maxLength: 200, allowEmpty: true }),
    confirmCancel: requiredPlainText({ maxLength: 200, allowEmpty: true }),
    claimTypePrompt: requiredPlainText({ maxLength: 200, allowEmpty: true }),
  }),
  announcement: z.object({
    enabled: z.boolean(),
    text: requiredDisplayHtml({ maxLength: 2000, allowEmpty: true }),
    type: alertTypeSchema,
    size: alertSizeSchema,
    glow: z.boolean().optional(),
    border: alertBorderSchema,
    link: nullableUrl({ allowRootRelative: true }),
    dismissible: z.boolean(),
  }).optional(),
  theme: z.object({
    activeTheme: portalThemeSchema,
  }).optional(),
});

const providerPermissionSchema = z.object({
  providerCode: requiredId(),
  name: requiredPlainText({ maxLength: 200 }),
  apiKey: requiredCredential(512),
  allowedCompanyIds: z.array(requiredId()).max(1000).transform((ids) => withUniqueArrayItems(ids)),
});

function createProviderPermissionsSchema(validCompanyIds: Set<string>) {
  return z.object({
    providers: z.array(providerPermissionSchema).max(200),
  }).superRefine((value, ctx) => {
    addUniqueKeyIssue(
      ctx,
      value.providers.map((provider) => provider.providerCode),
      "Provider codes"
    );

    for (const provider of value.providers) {
      for (const companyId of provider.allowedCompanyIds) {
        if (!validCompanyIds.has(companyId)) {
          ctx.addIssue({
            code: "custom",
            message: `Provider "${provider.providerCode}" references unknown company ID "${companyId}".`,
          });
        }
      }
    }
  });
}

const tpaCareCheckSchema = z.object({
  heading: requiredPlainText({ maxLength: 200, allowEmpty: true }),
  description: requiredDisplayHtml({ maxLength: 2000, allowEmpty: true }),
  imageUrl: nullableUrl({ allowRootRelative: true }),
  redirectCode: requiredId({ allowEmpty: true }),
  redirectId: requiredId({ allowEmpty: true }),
});

type CompanySectionData = z.infer<typeof companySectionSchema>;

function collectCompanyIds(section: CompanySectionData): string[] {
  const ids = section.companies.map((company) => company.id);

  for (const group of section.groups ?? []) {
    ids.push(...group.companies.map((company) => company.id));
  }

  return ids;
}

function getKnownCompanyIdsFromDisk(): Set<string> {
  const validCompanyIds = new Set<string>();

  for (const filename of COMPANY_SECTION_FILENAMES) {
    const section = companySectionSchema.parse(readRawContent(filename));

    for (const id of collectCompanyIds(section)) {
      validCompanyIds.add(id);
    }
  }

  return validCompanyIds;
}

function getSchemaForFilename(filename: ContentFilename) {
  switch (filename) {
    case "settings":
      return portalSettingsSchema;
    case "manual":
      return manualDataSchema;
    case "news":
      return newsDataSchema;
    case "tpacare-check":
      return tpaCareCheckSchema;
    case "insurance-companies":
    case "self-insured":
    case "international-insurance":
    case "deductible":
      return companySectionSchema;
    case "provider-permissions":
      return createProviderPermissionsSchema(getKnownCompanyIdsFromDisk());
    default: {
      const exhaustiveCheck: never = filename;
      return exhaustiveCheck;
    }
  }
}

export class ContentValidationError extends Error {
  filename: ContentFilename;
  issues: string[];

  constructor(filename: ContentFilename, issues: string[]) {
    super(`Validation failed for content file "${filename}".`);
    this.name = "ContentValidationError";
    this.filename = filename;
    this.issues = issues;
  }
}

export function formatZodIssues(error: ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });
}

export function parseContentData(
  filename: ContentFilename,
  data: unknown
): unknown {
  const schema = getSchemaForFilename(filename);
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ContentValidationError(filename, formatZodIssues(result.error));
  }

  return result.data;
}
