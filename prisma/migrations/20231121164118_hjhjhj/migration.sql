/*
  Warnings:

  - Changed the type of `dueDate` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `dueTime` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "dueDate",
ADD COLUMN     "dueDate" INTEGER NOT NULL,
DROP COLUMN "dueTime",
ADD COLUMN     "dueTime" INTEGER NOT NULL;
