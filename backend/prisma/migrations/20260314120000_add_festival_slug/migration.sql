-- Add slug column as nullable first
ALTER TABLE "festivals" ADD COLUMN "slug" TEXT;

-- Backfill: use id as slug for existing rows (UUID or custom id)
UPDATE "festivals" SET "slug" = "id" WHERE "slug" IS NULL;

-- Make slug required and unique
ALTER TABLE "festivals" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "festivals_slug_key" ON "festivals"("slug");
