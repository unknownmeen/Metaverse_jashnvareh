-- Add slug column as nullable first
ALTER TABLE "images" ADD COLUMN "slug" TEXT;

-- Backfill: use id as slug for existing rows
UPDATE "images" SET "slug" = "id" WHERE "slug" IS NULL;

-- Make slug required and unique
ALTER TABLE "images" ALTER COLUMN "slug" SET NOT NULL;
CREATE UNIQUE INDEX "images_slug_key" ON "images"("slug");
