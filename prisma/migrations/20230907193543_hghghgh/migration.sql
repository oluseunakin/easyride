/*
  Warnings:

  - You are about to drop the column `fullAddress` on the `Contact` table. All the data in the column will be lost.
  - Added the required column `country` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `street` to the `Contact` table without a default value. This is not possible if the table is not empty.
  - Added the required column `town` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "fullAddress",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "region" TEXT,
ADD COLUMN     "street" TEXT NOT NULL,
ADD COLUMN     "town" TEXT NOT NULL;
