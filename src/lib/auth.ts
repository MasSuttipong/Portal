import type { JWTPayload } from "jose";
import { SignJWT, jwtVerify } from "jose";
import { BASE_PATH } from "@/lib/base-path";
import { getRuntimeEnv } from "@/lib/runtime-env";

export const COOKIE_NAME = "admin_token";
export const PROVIDER_COOKIE_NAME = "provider_token";
export const SESSION_MAX_AGE = 8 * 60 * 60;

type AdminTokenPayload = JWTPayload & {
  role: "admin";
};

type ProviderTokenPayload = JWTPayload & {
  role: "provider";
  providerCode: string;
};

const getSecret = () => new TextEncoder().encode(getRuntimeEnv().jwtSecret);

export function getCookieOptions() {
  return {
    httpOnly: true,
    secure: getRuntimeEnv().cookieSecure,
    sameSite: "lax" as const,
    path: BASE_PATH || "/",
    maxAge: SESSION_MAX_AGE,
  };
}

export async function signToken(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify<AdminTokenPayload>(token, getSecret());
    return payload.role === "admin";
  } catch {
    return false;
  }
}

export async function signProviderToken(providerCode: string): Promise<string> {
  return new SignJWT({ role: "provider", providerCode })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyProviderToken(
  token: string
): Promise<{ providerCode: string } | null> {
  try {
    const { payload } = await jwtVerify<ProviderTokenPayload>(token, getSecret());

    if (
      payload.role !== "provider" ||
      typeof payload.providerCode !== "string" ||
      payload.providerCode.length === 0
    ) {
      return null;
    }

    return { providerCode: payload.providerCode };
  } catch {
    return null;
  }
}
