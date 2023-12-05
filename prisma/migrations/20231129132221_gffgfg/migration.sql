/*
  Warnings:

  - You are about to drop the column `dueTime` on the `Booking` table. All the data in the column will be lost.
  - Added the required column `dueHour` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dueMinute` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "dueTime",
ADD COLUMN     "dueHour" INTEGER NOT NULL,
ADD COLUMN     "dueMinute" INTEGER NOT NULL;
