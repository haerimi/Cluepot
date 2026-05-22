-- Add attendance status to schedule_members
ALTER TABLE "schedule_members" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending';

-- Add creator relation to schedules
ALTER TABLE "schedules" ADD COLUMN "created_by" TEXT;

ALTER TABLE "schedules" ADD CONSTRAINT "schedules_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
