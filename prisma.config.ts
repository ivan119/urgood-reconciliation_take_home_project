import 'dotenv/config'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  schema: './prisma/schema.prisma',
  datasource: {
    // Use DIRECT_URL for migrations (non-pgbouncer), fall back to DATABASE_URL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? '',
  },
})

