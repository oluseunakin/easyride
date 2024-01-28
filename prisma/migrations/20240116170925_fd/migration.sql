/*
  Warnings:

  - You are about to drop the column `contactId` on the `Vendor` table. All the data in the column will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `contact` to the `Vendor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_vendorId_fkey";

-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "contactId",
ADD COLUMN     "contact" JSONB NOT NULL;

-- DropTable
DROP TABLE "Contact";
