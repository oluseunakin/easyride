-- DropForeignKey
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_serviceName_fkey";

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_serviceName_fkey" FOREIGN KEY ("serviceName") REFERENCES "Service"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
