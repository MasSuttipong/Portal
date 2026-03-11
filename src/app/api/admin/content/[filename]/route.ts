import { NextRequest, NextResponse } from "next/server";
import { isValidFilename, readContent, writeContent } from "@/lib/content";

type RouteParams = { params: Promise<{ filename: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { filename } = await params;

  if (!isValidFilename(filename)) {
    return NextResponse.json(
      { error: `Invalid filename: "${filename}"` },
      { status: 400 }
    );
  }

  try {
    const data = readContent(filename);
    return NextResponse.json(data);
  } catch (err) {
    console.error(`Failed to read content file "${filename}":`, err);
    return NextResponse.json(
      { error: "Failed to read content file" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { filename } = await params;

  if (!isValidFilename(filename)) {
    return NextResponse.json(
      { error: `Invalid filename: "${filename}"` },
      { status: 400 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  try {
    writeContent(filename, body);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`Failed to write content file "${filename}":`, err);
    return NextResponse.json(
      { error: "Failed to write content file" },
      { status: 500 }
    );
  }
}
