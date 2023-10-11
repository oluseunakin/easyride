/*
  Warnings:

  - You are about to drop the column `lat` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the column `long` on the `Vendor` table. All the data in the column will be lost.
  - Added the required column `maxLat` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxLong` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minLat` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minLong` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "lat",
DROP COLUMN "long",
ADD COLUMN     "maxLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "maxLong" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minLat" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "minLong" DOUBLE PRECISION NOT NULL;
