import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

export default defineConfig({
  schema: "lib/prisma/schema.prisma",
  migrations: {
    path: "lib/prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});