/*
  Warnings:

  - You are about to drop the column `maxLat` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `maxLong` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `minLat` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `minLong` on the `Vendor` table. All the data in the column will be lost.
  - Added the required column `lat` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `long` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "maxLat",
DROP COLUMN "maxLong",
DROP COLUMN "minLat",
DROP COLUMN "minLong",
ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "long" DOUBLE PRECISION NOT NULL;
