import pkg from '@prisma/client'
const { PrismaClient } = pkg

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

/**
 * URGOOD Consolidated Prisma Singleton (STABLE)
 * 
 * By using the standard 'new PrismaClient()' with version 6.x,
 * we ensure the environment URL is picked up reliably on both
 * local machines and Vercel.
 */

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
