import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
  prismaPool?: InstanceType<typeof Pool>
}

const pool =
  globalForPrisma.prismaPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase pooler is TLS; keep it on in prod.
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : undefined,
  })

const adapter = new PrismaPg(pool)

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaPool = pool
}
