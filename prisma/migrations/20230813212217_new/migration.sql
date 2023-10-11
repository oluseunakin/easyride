/*
  Warnings:

  - You are about to drop the column `nameOfLocation` on the `Service` table. All the data in the column will be lost.
  - Added the required column `nameOfLocation` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Service" DROP CONSTRAINT "Service_nameOfLocation_fkey";

-- AlterTable
ALTER TABLE "Service" DROP COLUMN "nameOfLocation";

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "nameOfLocation" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_nameOfLocation_fkey" FOREIGN KEY ("nameOfLocation") REFERENCES "Location"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
