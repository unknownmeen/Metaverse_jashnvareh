ALTER TABLE "festivals"
ADD COLUMN "creatorId" TEXT;

ALTER TABLE "festivals"
ADD CONSTRAINT "festivals_creatorId_fkey"
FOREIGN KEY ("creatorId") REFERENCES "users"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

CREATE INDEX "festivals_creatorId_idx" ON "festivals"("creatorId");
