/*
  Warnings:

  - You are about to drop the column `coord` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Vendor` table. All the data in the column will be lost.
  - Added the required column `maxLat` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxLong` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minLat` to the `Vendor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minLong` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "coord",
DROP COLUMN "street";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "location",
ADD COLUMN     "maxLat" INTEGER NOT NULL,
ADD COLUMN     "maxLong" INTEGER NOT NULL,
ADD COLUMN     "minLat" INTEGER NOT NULL,
ADD COLUMN     "minLong" INTEGER NOT NULL;
