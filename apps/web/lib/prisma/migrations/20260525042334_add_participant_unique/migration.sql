/*
  Warnings:

  - A unique constraint covering the columns `[room_code,user_id]` on the table `participants` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "participants_room_code_user_id_key" ON "participants"("room_code", "user_id");
