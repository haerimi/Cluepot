-- CreateTable
CREATE TABLE "rooms" (
    "id" TEXT NOT NULL,
    "room_code" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT now() + interval '24 hours',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "participants" (
    "id" TEXT NOT NULL,
    "room_code" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "abstract_location" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "transport" TEXT,
    "is_host" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rooms_room_code_key" ON "rooms"("room_code");

-- AddForeignKey
ALTER TABLE "participants" ADD CONSTRAINT "participants_room_code_fkey" FOREIGN KEY ("room_code") REFERENCES "rooms"("room_code") ON DELETE CASCADE ON UPDATE CASCADE;
