/* eslint-disable @typescript-eslint/no-require-imports */
const { spawn } = require("child_process");
const {
  BASE_PATH_ENV_NAME,
  BASE_PATH_SENTINEL,
} = require("./runtime-base-path");

const nextCli = require.resolve("next/dist/bin/next");

const env = {
  ...process.env,
  [BASE_PATH_ENV_NAME]: BASE_PATH_SENTINEL,
};

if (
  process.env[BASE_PATH_ENV_NAME] &&
  process.env[BASE_PATH_ENV_NAME] !== BASE_PATH_SENTINEL
) {
  console.log(
    `Ignoring ${BASE_PATH_ENV_NAME} during production build and using the runtime sentinel instead.`
  );
}

const child = spawn(process.execPath, [nextCli, "build"], {
  stdio: "inherit",
  env,
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error("Failed to start the production build.", error);
  process.exit(1);
});
