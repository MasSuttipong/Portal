import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import { stripBasePath, withBasePath } from "@/lib/base-path";

export async function proxy(request: NextRequest) {
  const pathname = stripBasePath(request.nextUrl.pathname);

  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isValid = token ? await verifyToken(token) : false;

  if (!isValid) {
    // API routes return 401 JSON
    if (pathname.startsWith("/api/admin/")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Page routes redirect to login (skip if already on login page)
    if (pathname.startsWith("/admin/") && pathname !== "/admin/login") {
      const loginUrl = new URL(withBasePath("/admin/login"), request.url);
      return NextResponse.redirect(loginUrl);
    }

    if (pathname === "/admin") {
      const loginUrl = new URL(withBasePath("/admin/login"), request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/:basePath/admin/:path*",
    "/:basePath/api/admin/:path*",
  ],
};
