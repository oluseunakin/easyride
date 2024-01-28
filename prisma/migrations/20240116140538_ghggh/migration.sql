-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_serviceName_fkey";

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_serviceName_fkey" FOREIGN KEY ("serviceName") REFERENCES "Service"("name") ON DELETE CASCADE ON UPDATE CASCADE;
