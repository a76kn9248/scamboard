-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "chain" TEXT DEFAULT 'ETH',
ADD COLUMN     "disputeCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscammerId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentlyDoing" TEXT DEFAULT '',
ADD COLUMN     "mood" TEXT DEFAULT 'vibing',
ADD COLUMN     "specialty" TEXT DEFAULT '',
ADD COLUMN     "themeSongLabel" TEXT,
ADD COLUMN     "themeSongUrl" TEXT,
ALTER COLUMN "profileColor" SET DEFAULT '#ff3b9a';

-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WallPost" (
    "id" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WallPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscammer" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscammer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Dispute_userId_reportId_key" ON "Dispute"("userId", "reportId");

-- CreateIndex
CREATE INDEX "WallPost_userId_createdAt_idx" ON "WallPost"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Subscammer_slug_key" ON "Subscammer"("slug");

-- CreateIndex
CREATE INDEX "Report_subscammerId_idx" ON "Report"("subscammerId");

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_subscammerId_fkey" FOREIGN KEY ("subscammerId") REFERENCES "Subscammer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WallPost" ADD CONSTRAINT "WallPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WallPost" ADD CONSTRAINT "WallPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
