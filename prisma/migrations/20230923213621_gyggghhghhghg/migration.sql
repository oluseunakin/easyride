/*
  Warnings:

  - A unique constraint covering the columns `[vendorId]` on the table `Contact` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `vendorId` to the `Contact` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_contactId_fkey";

-- AlterTable
CREATE SEQUENCE contact_id_seq;
ALTER TABLE "Contact" ADD COLUMN     "vendorId" INTEGER NOT NULL,
ALTER COLUMN "id" SET DEFAULT nextval('contact_id_seq');
ALTER SEQUENCE contact_id_seq OWNED BY "Contact"."id";

-- CreateIndex
CREATE UNIQUE INDEX "Contact_vendorId_key" ON "Contact"("vendorId");

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
