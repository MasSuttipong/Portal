import { SignJWT, jwtVerify } from "jose";
import { BASE_PATH } from "@/lib/base-path";
import { getRuntimeEnv } from "@/lib/runtime-env";

export const COOKIE_NAME = "admin_token";
export const SESSION_MAX_AGE = 8 * 60 * 60;

const getSecret = () => {
  const secret = getRuntimeEnv().jwtSecret || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is required");
  return new TextEncoder().encode(secret);
};

export async function signToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === "true",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 8 * 60 * 60, // 8 hours
};
