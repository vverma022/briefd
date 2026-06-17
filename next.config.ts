import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Keep the generated Prisma client out of the bundler so its engine
  // references aren't mis-bundled by Turbopack.
  serverExternalPackages: ["@prisma/client"],
}

export default nextConfig
