/*
  Warnings:

  - You are about to drop the column `due` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `overOrCanceled` on the `Booking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "due",
DROP COLUMN "overOrCanceled",
ADD COLUMN     "dueDate" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dueTime" TEXT NOT NULL DEFAULT '';
