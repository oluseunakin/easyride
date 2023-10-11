/*
  Warnings:

  - Made the column `contactId` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Vendor" ALTER COLUMN "contactId" SET NOT NULL;
