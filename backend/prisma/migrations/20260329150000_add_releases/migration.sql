-- CreateTable
CREATE TABLE "releases" (
    "id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "improvements" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bugFixes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "releases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "releases_version_key" ON "releases"("version");
