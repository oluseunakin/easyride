-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "contactId" INTEGER;

-- CreateTable
CREATE TABLE "Contact" (
    "vendorId" INTEGER NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "fullAddress" TEXT,
    "open" TEXT,
    "close" TEXT,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("vendorId")
);

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
