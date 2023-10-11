/*
  Warnings:

  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `name` on the `Location` table. All the data in the column will be lost.
  - Added the required column `country` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `town` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_nameOfLocation_fkey";

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "state" TEXT;

-- AlterTable
ALTER TABLE "Location" DROP CONSTRAINT "Location_pkey",
DROP COLUMN "name",
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "town" TEXT NOT NULL,
ADD CONSTRAINT "Location_pkey" PRIMARY KEY ("town");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_nameOfLocation_fkey" FOREIGN KEY ("nameOfLocation") REFERENCES "Location"("town") ON DELETE RESTRICT ON UPDATE CASCADE;
