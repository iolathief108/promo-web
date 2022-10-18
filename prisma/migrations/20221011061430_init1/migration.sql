-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT,
ALTER COLUMN "variant_1_name" DROP NOT NULL,
ALTER COLUMN "variant_1_price" DROP NOT NULL,
ALTER COLUMN "variant_1_in_stock" DROP NOT NULL,
ALTER COLUMN "variant_2_name" DROP NOT NULL,
ALTER COLUMN "variant_2_price" DROP NOT NULL,
ALTER COLUMN "variant_2_in_stock" DROP NOT NULL;
