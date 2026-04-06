import pkg from '@prisma/client'
const { PrismaClient } = pkg

// Safe global singleton for local development
const globalForPrisma = globalThis as unknown as { prisma: any }

const url = process.env.DATABASE_URL || 'file:./dev.db'

/**
 * URGOOD Final Prisma 7.0+ Singleton
 * 
 * Works by supplying the datasource explicitly to the client.
 */

const createPrismaClient = () => {
    return new PrismaClient({
      datasourceUrl: url
    } as any)
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
