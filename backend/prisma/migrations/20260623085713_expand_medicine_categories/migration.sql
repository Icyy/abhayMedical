-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MedicineCategory" ADD VALUE 'PERSONAL_CARE';
ALTER TYPE "MedicineCategory" ADD VALUE 'FOOD_SUPPLEMENT';
ALTER TYPE "MedicineCategory" ADD VALUE 'BABY_CARE';
ALTER TYPE "MedicineCategory" ADD VALUE 'GENERAL_STORE';
