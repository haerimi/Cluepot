-- CreateTable
CREATE TABLE "available_dates" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "room_code" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "available_dates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "available_dates_room_code_user_id_date_key" ON "available_dates"("room_code", "user_id", "date");

-- AddForeignKey
ALTER TABLE "available_dates" ADD CONSTRAINT "available_dates_room_code_fkey" FOREIGN KEY ("room_code") REFERENCES "rooms"("room_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "available_dates" ADD CONSTRAINT "available_dates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
