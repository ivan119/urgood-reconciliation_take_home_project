import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

/**
 * URGOOD Hybrid Prisma Singleton
 * 
 * This client detects the environment based on the DATABASE_URL:
 * - Local: uses better-sqlite3 with the Prisma adapter (file: prefix)
 * - Production/Vercel: uses the standard Prisma Client for PostgreSQL
 */

const url = process.env.DATABASE_URL || 'file:./dev.db'

let prismaInstance: PrismaClient

if (url.startsWith('file:')) {
  // SQLite Mode (Development)
  const adapter = new PrismaBetterSqlite3(
    { url },
    { fileMustExist: false },
  )
  prismaInstance = new PrismaClient({ adapter })
} else {
  // PostgreSQL Mode (Vercel / Production)
  // Ensure the schema.prisma provider is set to "postgresql" for this mode.
  prismaInstance = new PrismaClient()
}

export const prisma = globalForPrisma.prisma ?? prismaInstance

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
