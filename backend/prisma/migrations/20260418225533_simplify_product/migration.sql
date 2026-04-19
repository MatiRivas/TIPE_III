/*
  Warnings:

  - You are about to drop the column `minStock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `Ingredient` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "minStock",
DROP COLUMN "stock",
ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "Ingredient";
