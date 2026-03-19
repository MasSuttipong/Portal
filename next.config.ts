import type { NextConfig } from "next";
import { BASE_PATH } from "./src/lib/base-path";

const nextConfig: NextConfig = {
  output: "standalone",
  ...(BASE_PATH ? { basePath: BASE_PATH } : {}),
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self';" },
        ],
      },
    ];
  },
};

export default nextConfig;
