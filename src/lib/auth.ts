import { SignJWT, jwtVerify } from "jose";
import { BASE_PATH } from "@/lib/base-path";
import { getRuntimeEnv } from "@/lib/runtime-env";

export const COOKIE_NAME = "admin_token";
export const SESSION_MAX_AGE = 8 * 60 * 60;

const getSecret = () =>
  new TextEncoder().encode(getRuntimeEnv().jwtSecret);

export async function signToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: getRuntimeEnv().cookieSecure,
    sameSite: "lax" as const,
    path: BASE_PATH || "/",
    maxAge: SESSION_MAX_AGE,
  };
}
