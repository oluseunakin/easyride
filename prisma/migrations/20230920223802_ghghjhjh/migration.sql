-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_vendorId_fkey";

-- AlterTable
ALTER TABLE "Media" ALTER COLUMN "vendorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
