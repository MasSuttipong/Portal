/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const {
  BASE_PATH_ENV_NAME,
  BASE_PATH_MARKER_PATH,
  BASE_PATH_SENTINEL,
  readValidatedBasePath,
} = require("./runtime-base-path");

const TEXT_FILE_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".map",
  ".mjs",
  ".txt",
]);

const DISPLAY_ROOT_BASE_PATH = "/";
const ESCAPED_BASE_PATH_SENTINEL = `\\${BASE_PATH_SENTINEL}`;
const DOUBLE_ESCAPED_BASE_PATH_SENTINEL = `\\\\${BASE_PATH_SENTINEL}`;

function collectPatchableFiles(directoryPath, markerPath, files = []) {
  for (const entry of fs.readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = path.join(directoryPath, entry.name);

    if (entry.isDirectory()) {
      collectPatchableFiles(entryPath, markerPath, files);
      continue;
    }

    if (entryPath === markerPath) {
      continue;
    }

    if (TEXT_FILE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(entryPath);
    }
  }

  return files;
}

function countOccurrences(source, searchValue) {
  return source.split(searchValue).length - 1;
}

function normalizeRoutesManifest(filePath, contents, runtimeBasePath) {
  if (
    runtimeBasePath.length > 0 ||
    path.basename(filePath) !== "routes-manifest.json"
  ) {
    return contents;
  }

  const manifest = JSON.parse(contents);

  manifest.redirects = manifest.redirects.filter(
    (redirect) =>
      !(
        redirect.source === "/" &&
        redirect.destination === "" &&
        redirect.basePath === false &&
        redirect.internal === true &&
        redirect.statusCode === 308
      )
  );

  return JSON.stringify(manifest, null, 2);
}

function applyReplacement(filePath, runtimeBasePath) {
  const contents = fs.readFileSync(filePath, "utf8");
  const replacements = countOccurrences(contents, BASE_PATH_SENTINEL);

  if (replacements === 0) {
    return 0;
  }

  const updatedContents =
    runtimeBasePath.length === 0
      ? contents
          .replaceAll(DOUBLE_ESCAPED_BASE_PATH_SENTINEL, "")
          .replaceAll(ESCAPED_BASE_PATH_SENTINEL, "")
          .replaceAll(BASE_PATH_SENTINEL, "")
      : contents.replaceAll(BASE_PATH_SENTINEL, runtimeBasePath);

  fs.writeFileSync(
    filePath,
    normalizeRoutesManifest(filePath, updatedContents, runtimeBasePath)
  );

  return replacements;
}

function readMarker(markerPath) {
  if (!fs.existsSync(markerPath)) {
    return null;
  }

  return JSON.parse(fs.readFileSync(markerPath, "utf8"));
}

function writeMarker(markerPath, runtimeBasePath) {
  fs.mkdirSync(path.dirname(markerPath), { recursive: true });
  fs.writeFileSync(
    markerPath,
    JSON.stringify(
      {
        envName: BASE_PATH_ENV_NAME,
        sentinel: BASE_PATH_SENTINEL,
        basePath: runtimeBasePath,
        appliedAt: new Date().toISOString(),
      },
      null,
      2
    )
  );
}

function main() {
  const runtimeBasePath = readValidatedBasePath();
  const rootDir = process.cwd();
  const nextDir = path.join(rootDir, ".next");
  const markerPath = path.join(rootDir, BASE_PATH_MARKER_PATH);
  const existingMarker = readMarker(markerPath);

  if (existingMarker) {
    if (existingMarker.basePath !== runtimeBasePath) {
      throw new Error(
        `Runtime base path was already applied as ` +
          `"${existingMarker.basePath || DISPLAY_ROOT_BASE_PATH}". ` +
          `Start a fresh container or rebuild the local output before using ` +
          `"${runtimeBasePath || DISPLAY_ROOT_BASE_PATH}".`
      );
    }

    console.log(
      `Runtime base path already applied: ` +
        `"${runtimeBasePath || DISPLAY_ROOT_BASE_PATH}".`
    );
    return;
  }

  if (!fs.existsSync(nextDir)) {
    throw new Error(
      `Cannot apply runtime base path because "${nextDir}" does not exist. ` +
        `Run the production build first.`
    );
  }

  const filesToPatch = collectPatchableFiles(nextDir, markerPath);
  const standaloneServerPath = path.join(rootDir, "server.js");

  if (fs.existsSync(standaloneServerPath)) {
    filesToPatch.push(standaloneServerPath);
  }

  let patchedFileCount = 0;
  let replacementCount = 0;

  for (const filePath of filesToPatch) {
    const replacements = applyReplacement(filePath, runtimeBasePath);

    if (replacements > 0) {
      patchedFileCount += 1;
      replacementCount += replacements;
    }
  }

  if (replacementCount === 0) {
    throw new Error(
      `Runtime base path sentinel "${BASE_PATH_SENTINEL}" was not found in the built output. ` +
        `Rebuild the app with "npm run build" before starting it.`
    );
  }

  writeMarker(markerPath, runtimeBasePath);

  console.log(
    `Applied runtime base path "${runtimeBasePath || DISPLAY_ROOT_BASE_PATH}" ` +
      `to ${patchedFileCount} files (${replacementCount} replacements).`
  );
}

main();
