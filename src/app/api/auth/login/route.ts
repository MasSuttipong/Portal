import { NextRequest, NextResponse } from "next/server";
import { signToken, COOKIE_NAME, getCookieOptions } from "@/lib/auth";
import { getRuntimeEnv } from "@/lib/runtime-env";

export async function POST(request: NextRequest) {
  let body: { password?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { password } = body;

  if (!password || password !== getRuntimeEnv().adminPassword) {
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
