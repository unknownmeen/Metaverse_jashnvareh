ALTER TABLE "images"
ADD COLUMN "galleryUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "images"
SET "galleryUrls" = ARRAY["url"];
