/*
  Warnings:

  - You are about to drop the column `nameOfLocation` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the `Location` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `location` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_nameOfLocation_fkey";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "nameOfLocation",
ADD COLUMN     "location" TEXT NOT NULL;

-- DropTable
DROP TABLE "Location";
