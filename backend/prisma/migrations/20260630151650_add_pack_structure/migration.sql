-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "packType" TEXT NOT NULL DEFAULT 'strip',
ADD COLUMN     "unitsPerPack" INTEGER NOT NULL DEFAULT 1;
