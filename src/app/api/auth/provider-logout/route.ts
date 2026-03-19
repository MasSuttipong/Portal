import { NextResponse } from "next/server";
import { PROVIDER_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set(PROVIDER_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
