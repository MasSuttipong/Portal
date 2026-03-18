/* eslint-disable @typescript-eslint/no-require-imports */
const { readValidatedBasePath } = require("./runtime-base-path");

function readRequiredEnv(name) {
  const value = process.env[name];

  if (value === undefined || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

function validateCookieSecure() {
  const value = process.env.COOKIE_SECURE;

  if (value === undefined || value.length === 0) {
    return;
  }

  if (value !== "true" && value !== "false") {
    throw new Error(
      'Invalid environment variable COOKIE_SECURE. Expected "true" or "false".'
    );
  }
}

function validateBasePath() {
  readValidatedBasePath();
}

readRequiredEnv("ADMIN_PASSWORD");
readRequiredEnv("JWT_SECRET");
validateCookieSecure();
validateBasePath();
