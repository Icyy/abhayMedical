/*
  Warnings:

  - You are about to drop the column `batchNumber` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `expiryDate` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `manufacturingDate` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `purchasePrice` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Medicine` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `PrescriptionItem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Medicine` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Medicine_batchNumber_key";

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "batchNumber",
DROP COLUMN "expiryDate",
DROP COLUMN "manufacturingDate",
DROP COLUMN "price",
DROP COLUMN "purchasePrice",
DROP COLUMN "status",
DROP COLUMN "stock",
ADD COLUMN     "mrp" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PrescriptionItem" DROP COLUMN "price",
ADD COLUMN     "batchId" TEXT,
ADD COLUMN     "pricePerUnit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "sellAsPackOf" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "MedicineBatch" (
    "id" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "batchNumber" TEXT NOT NULL,
    "manufacturingDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "purchasePrice" DOUBLE PRECISION NOT NULL,
    "stockUnits" INTEGER NOT NULL,
    "supplierId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicineBatch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MedicineBatch_batchNumber_key" ON "MedicineBatch"("batchNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Medicine_name_key" ON "Medicine"("name");

-- AddForeignKey
ALTER TABLE "MedicineBatch" ADD CONSTRAINT "MedicineBatch_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
