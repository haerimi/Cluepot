import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../web/generated/prisma/client";

// Prevent multiple PrismaClient instances (and PG connection pools) under
// Next.js HMR in development. In production each module is imported once, so
// the global cache is not needed — but it is safe to use there too.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };


function createPrismaClient() {
  const connectionString = `${process.env.DIRECT_URL}`;

  if (!connectionString) {
    throw new Error("DIRECT_URL 환경변수가 설정되지 않았습니다.");
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export { prisma };