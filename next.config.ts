import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Keep the generated Prisma client out of the bundler so its engine
  // references aren't mis-bundled by Turbopack.
  serverExternalPackages: ["@prisma/client"],
  async headers() {
    return [
      {
        // Always serve the freshest service worker, with the correct MIME type,
        // and allow it to control the whole origin.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ]
  },
}

export default nextConfig
