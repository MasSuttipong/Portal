import { NextRequest, NextResponse } from "next/server";
import {
  getCookieOptions,
  PROVIDER_COOKIE_NAME,
  signProviderToken,
} from "@/lib/auth";
import { withBasePath } from "@/lib/base-path";
import { readContent } from "@/lib/content";
import {
  parseProviderLoginBody,
  RequestValidationError,
} from "@/lib/request-validation";
import type { ProviderPermissions } from "@/types/portal";

const GENERIC_ERROR = { error: "Invalid credentials" };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { providerCode, apiKey } = parseProviderLoginBody(body);

    if (!providerCode || !apiKey) {
      return NextResponse.json(GENERIC_ERROR, { status: 401 });
    }

    const permissions = readContent<ProviderPermissions>("provider-permissions");
    const provider = permissions.providers.find(
      (p) => p.providerCode === providerCode && p.apiKey === apiKey
    );

    if (!provider) {
      return NextResponse.json(GENERIC_ERROR, { status: 401 });
    }

    const token = await signProviderToken(providerCode);
    const response = NextResponse.json({
      success: true,
      providerCode,
      // This is a browser-ready path for raw navigation, not a Next router href.
      redirect: withBasePath("/"),
    });

    response.cookies.set(PROVIDER_COOKIE_NAME, token, getCookieOptions());
    return response;
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
