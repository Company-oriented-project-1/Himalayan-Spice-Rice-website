-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('NONE', 'PERCENTAGE', 'FLAT');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discountType" "DiscountType" DEFAULT 'NONE',
ADD COLUMN     "salePrice" DECIMAL(10,2);
