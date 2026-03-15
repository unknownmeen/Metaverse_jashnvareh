ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'JUDGE_LEVEL_1';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'JUDGE_LEVEL_2';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'JUDGE_LEVEL_3';

CREATE TYPE "RatingCategory" AS ENUM ('USER', 'JUDGE');

ALTER TABLE "comments"
ADD COLUMN "isJudgeReview" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "ratings"
ADD COLUMN "maxScore" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN "category" "RatingCategory" NOT NULL DEFAULT 'USER';

DROP INDEX "ratings_imageId_userId_key";
CREATE UNIQUE INDEX "ratings_imageId_userId_category_key" ON "ratings"("imageId", "userId", "category");
