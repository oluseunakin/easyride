/*
  Warnings:

  - The primary key for the `Service` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `synonyms` on the `Service` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Service` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_serviceName_fkey";

-- AlterTable
ALTER TABLE "Service" DROP CONSTRAINT "Service_pkey",
DROP COLUMN "synonyms",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Service_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "Synonym" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serviceId" INTEGER NOT NULL,

    CONSTRAINT "Synonym_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Synonym_name_key" ON "Synonym"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Service_name_key" ON "Service"("name");

-- AddForeignKey
ALTER TABLE "Synonym" ADD CONSTRAINT "Synonym_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_serviceName_fkey" FOREIGN KEY ("serviceName") REFERENCES "Service"("name") ON DELETE CASCADE ON UPDATE CASCADE;
