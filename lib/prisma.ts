import { PrismaClient } from "@prisma/client"

import { config } from "@/lib/config"

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.isDev ? ["error", "warn"] : ["error"],
  })

if (!config.isProd) globalForPrisma.prisma = prisma
