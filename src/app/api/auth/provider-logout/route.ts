import { NextResponse } from "next/server";
import { getCookieOptions, PROVIDER_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(PROVIDER_COOKIE_NAME, "", {
    ...getCookieOptions(),
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
