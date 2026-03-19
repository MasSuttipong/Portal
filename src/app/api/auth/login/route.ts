import { NextRequest, NextResponse } from "next/server";
import { signToken, COOKIE_NAME, getCookieOptions } from "@/lib/auth";
import { getRuntimeEnv } from "@/lib/runtime-env";
import {
  parseAdminLoginBody,
  RequestValidationError,
} from "@/lib/request-validation";

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  let password: string;

  try {
    password = parseAdminLoginBody(body).password;
  } catch (error) {
    if (error instanceof RequestValidationError) {
      return NextResponse.json(
        { error: "Validation failed", issues: error.issues },
        { status: 400 }
      );
    }

    throw error;
  }

  let adminPassword: string;

  try {
    adminPassword = getRuntimeEnv().adminPassword;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("ADMIN_PASSWORD")
    ) {
      return NextResponse.json(
        { error: "Server misconfigured: ADMIN_PASSWORD not set" },
        { status: 500 }
      );
    }

    throw error;
  }

  if (password !== adminPassword) {
    return NextResponse.json(
      { error: "รหัสผ่านไม่ถูกต้อง" },
      { status: 401 }
    );
  }

  const token = await signToken();

  const response = NextResponse.json({ success: true });
  response.cookies.set(COOKIE_NAME, token, getCookieOptions());

  return response;
}
