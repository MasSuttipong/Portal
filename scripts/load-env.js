/* eslint-disable @typescript-eslint/no-require-imports */

let hasLoaded = false;

function loadScriptEnv(projectRoot = process.cwd()) {
  if (hasLoaded) {
    return;
  }

  let loadEnvConfig;

  try {
    ({ loadEnvConfig } = require("@next/env"));
  } catch (error) {
    if (
      error &&
      error.code === "MODULE_NOT_FOUND" &&
      typeof error.message === "string" &&
      error.message.includes("@next/env")
    ) {
      return;
    }

    throw error;
  }

  const isDev = process.env.NODE_ENV !== "production";
  loadEnvConfig(projectRoot, isDev);
  hasLoaded = true;
}

module.exports = {
  loadScriptEnv,
};
