-- AlterTable
ALTER TABLE "PurchaseOrderItem" ADD COLUMN     "batchNumber" TEXT,
ADD COLUMN     "expiryDate" TIMESTAMP(3),
ADD COLUMN     "gstPercent" DOUBLE PRECISION,
ADD COLUMN     "manufacturingDate" TIMESTAMP(3),
ADD COLUMN     "sellingPrice" DOUBLE PRECISION;
