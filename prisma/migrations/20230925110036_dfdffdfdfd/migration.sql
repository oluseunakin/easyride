/*
  Warnings:

  - You are about to drop the column `city` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Contact` table. All the data in the column will be lost.
  - You are about to drop the column `town` on the `Contact` table. All the data in the column will be lost.
  - Added the required column `coord` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "region",
DROP COLUMN "state",
DROP COLUMN "town",
ADD COLUMN     "coord" TEXT NOT NULL;
