type RequiredEnvName = "ADMIN_PASSWORD" | "JWT_SECRET";

type RuntimeEnv = {
  adminPassword: string;
  jwtSecret: string;
  cookieSecure: boolean;
};

let runtimeEnv: RuntimeEnv | null = null;

function readRequiredEnv(name: RequiredEnvName): string {
  const value = process.env[name];

  if (value === undefined || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function readCookieSecure(): boolean {
  const value = process.env.COOKIE_SECURE;

  if (value === undefined || value.length === 0) {
    return false;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(
    'Invalid environment variable COOKIE_SECURE. Expected "true" or "false".'
  );
}

function loadRuntimeEnv(): RuntimeEnv {
  return {
    adminPassword: readRequiredEnv("ADMIN_PASSWORD"),
    jwtSecret: readRequiredEnv("JWT_SECRET"),
    cookieSecure: readCookieSecure(),
  };
}

export function getRuntimeEnv(): RuntimeEnv {
  if (!runtimeEnv) {
    runtimeEnv = loadRuntimeEnv();
  }

  return runtimeEnv;
}

export function validateRuntimeEnv(): void {
  getRuntimeEnv();
}
