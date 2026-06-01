import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "lib/prisma/schema.prisma",
  migrations: {
    path: "lib/prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});