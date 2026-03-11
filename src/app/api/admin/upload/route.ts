import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, mkdirSync } from "fs";
import { join, extname } from "path";

const ALLOWED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"]);
const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Failed to parse form data" },
      { status: 400 }
    );
  }

  const file = formData.get("file");

  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      { error: "No file provided. Expected a form field named 'file'." },
      { status: 400 }
    );
  }

  const ext = extname(file.name).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext) || !ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Allowed types: png, jpg, jpeg, gif, webp, svg" },
      { status: 400 }
    );
  }

  const timestamp = Date.now();
  // Strip non-alphanumeric characters from the original base name to keep filenames clean
  const baseName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 64);
  const filename = `${timestamp}-${baseName}${ext}`;

  const imagesDir = join(process.cwd(), "public", "images");

  try {
    mkdirSync(imagesDir, { recursive: true });
  } catch (err) {
    console.error("Failed to create images directory:", err);
    return NextResponse.json(
      { error: "Server error: could not create upload directory" },
      { status: 500 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    writeFileSync(join(imagesDir, filename), buffer);
  } catch (err) {
    console.error("Failed to save uploaded file:", err);
    return NextResponse.json(
      { error: "Server error: could not save file" },
      { status: 500 }
    );
  }

  return NextResponse.json({ url: `/images/${filename}` });
}
