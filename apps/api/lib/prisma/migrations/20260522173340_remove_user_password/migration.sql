/*
  Warnings:

  - You are about to drop the column `transport` on the `participants` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "participants" DROP COLUMN "transport",
ADD COLUMN     "atmosphere_preference" TEXT,
ADD COLUMN     "distance_tolerance" TEXT,
ADD COLUMN     "transports" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password";
