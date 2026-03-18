import { NextRequest, NextResponse } from "next/server";
import { signProviderToken, PROVIDER_COOKIE_NAME, cookieOptions } from "@/lib/auth";
import { readContent } from "@/lib/content";
import type { ProviderPermissions } from "@/types/portal";

const GENERIC_ERROR = { error: "Invalid credentials" };

export async function POST(request: NextRequest) {
  try {
    const { providerCode, apiKey } = await request.json();

    if (!providerCode || typeof providerCode !== "string" || !apiKey || typeof apiKey !== "string") {
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
      redirect: "/",
    });

    response.cookies.set(PROVIDER_COOKIE_NAME, token, cookieOptions);
    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
