import pkg from '@prisma/client'
const { PrismaClient } = pkg

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

/**
 * URGOOD Standard Prisma Singleton
 * 
 * Works reliably in both Local & Vercel environments using the environment
 * variable (DATABASE_URL) defined in the schema.
 */

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
