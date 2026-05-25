/*
  Warnings:

  - You are about to drop the column `status` on the `schedule_members` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "link_expires_at" SET DEFAULT now() + interval '4 hours';

-- AlterTable
ALTER TABLE "schedule_members" DROP COLUMN "status";
