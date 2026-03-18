import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "admin_token";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
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

// Provider auth
export const PROVIDER_COOKIE_NAME = "provider_token";

export async function signProviderToken(providerCode: string): Promise<string> {
  return new SignJWT({ providerCode, role: "provider" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifyProviderToken(token: string): Promise<{ providerCode: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role === "provider" && typeof payload.providerCode === "string") {
      return { providerCode: payload.providerCode };
    }
    return null;
  } catch {
    return null;
  }
}
