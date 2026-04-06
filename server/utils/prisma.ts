import pkg from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'

const { PrismaClient } = pkg

const globalForPrisma = globalThis as unknown as { prisma: any }

/**
 * URGOOD Hybrid Prisma Singleton (Vercel-Ready)
 * 
 * This version uses a default import pattern and 'any' typing/casting to bypass
 * ESM resolution errors in Nitro/Vercel serverless environments.
 */

const url = process.env.DATABASE_URL || 'file:./dev.db'

const createPrismaClient = () => {
  if (url.startsWith('file:')) {
    // SQLite Mode (Development)
    const adapter = new PrismaBetterSqlite3(
      { url },
      { fileMustExist: false },
    )
    return new PrismaClient({ adapter })
  } else {
    // PostgreSQL Mode (Vercel / Production)
    return new PrismaClient()
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
