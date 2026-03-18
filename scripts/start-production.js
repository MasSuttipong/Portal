/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { spawn, spawnSync } = require("child_process");

const repoRoot = process.cwd();
const runtimeDir = path.join(repoRoot, ".next", "runtime-standalone");
const standaloneDir = path.join(repoRoot, ".next", "standalone");
const staticDir = path.join(repoRoot, ".next", "static");

function assertExists(targetPath, label) {
  if (!fs.existsSync(targetPath)) {
    throw new Error(`Missing ${label} at "${targetPath}". Run "npm run build" first.`);
  }
}

function prepareRuntimeDir() {
  assertExists(standaloneDir, "standalone build output");
  assertExists(staticDir, "static build output");

  fs.rmSync(runtimeDir, { recursive: true, force: true });
  fs.cpSync(standaloneDir, runtimeDir, { recursive: true, force: true });
  fs.cpSync(staticDir, path.join(runtimeDir, ".next", "static"), {
    recursive: true,
    force: true,
  });

  for (const directoryName of ["public", "content"]) {
    const sourcePath = path.join(repoRoot, directoryName);

    if (fs.existsSync(sourcePath)) {
      fs.cpSync(sourcePath, path.join(runtimeDir, directoryName), {
        recursive: true,
        force: true,
      });
    }
  }

  fs.mkdirSync(path.join(runtimeDir, "scripts"), { recursive: true });

  for (const scriptName of [
    "apply-runtime-base-path.js",
    "runtime-base-path.js",
    "validate-runtime-env.js",
  ]) {
    fs.copyFileSync(
      path.join(repoRoot, "scripts", scriptName),
      path.join(runtimeDir, "scripts", scriptName)
    );
  }
}

function runNodeScript(scriptRelativePath) {
  const result = spawnSync(process.execPath, [scriptRelativePath], {
    cwd: runtimeDir,
    env: process.env,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  prepareRuntimeDir();
  runNodeScript(path.join("scripts", "apply-runtime-base-path.js"));
  runNodeScript(path.join("scripts", "validate-runtime-env.js"));

  const child = spawn(process.execPath, ["server.js"], {
    cwd: runtimeDir,
    env: process.env,
    stdio: "inherit",
  });

  const forwardSignal = (signal) => {
    if (child.exitCode === null) {
      child.kill(signal);
    }
  };

  process.on("SIGINT", () => forwardSignal("SIGINT"));
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));

  child.on("exit", (code) => {
    process.exit(code ?? 1);
  });
}

main();
