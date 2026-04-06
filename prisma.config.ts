import { defineConfig } from "prisma/config";

// Detect if we should use local sqlite file or remote DATABASE_URL
const url = process.env.DATABASE_URL || "file:./dev.db";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url,
  }
});
