/*
  Warnings:

  - You are about to drop the column `dueHour` on the `Booking` table. All the data in the column will be lost.
  - You are about to drop the column `dueMinute` on the `Booking` table. All the data in the column will be lost.
  - The `dueDate` column on the `Booking` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Contact` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Contact` table. All the data in the column will be lost.
  - The primary key for the `Post` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the column `likes` on the `Post` table. All the data in the column will be lost.
  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Media` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `commentPostId` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commentorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_postId_fkey";

-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_commentId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_postId_fkey";

-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_vendorId_fkey";

-- DropForeignKey
ALTER TABLE "Vendor" DROP CONSTRAINT "Vendor_serviceName_fkey";

-- DropIndex
DROP INDEX "Contact_vendorId_key";

-- AlterTable
ALTER TABLE "Booking" DROP COLUMN "dueHour",
DROP COLUMN "dueMinute",
DROP COLUMN "dueDate",
ADD COLUMN     "dueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "Contact_pkey" PRIMARY KEY ("vendorId");

-- AlterTable
ALTER TABLE "Post" DROP CONSTRAINT "Post_pkey",
DROP COLUMN "id",
DROP COLUMN "likes",
ADD COLUMN     "commentPostId" INTEGER NOT NULL,
ADD COLUMN     "media" JSONB[],
ADD CONSTRAINT "Post_pkey" PRIMARY KEY ("vendorId");

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "cover" JSONB[];

-- DropTable
DROP TABLE "Comment";

-- DropTable
DROP TABLE "Media";

-- CreateTable
CREATE TABLE "_PostToUser" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PostToUser_AB_unique" ON "_PostToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_PostToUser_B_index" ON "_PostToUser"("B");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_serviceName_fkey" FOREIGN KEY ("serviceName") REFERENCES "Service"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_commentPostId_fkey" FOREIGN KEY ("commentPostId") REFERENCES "Post"("vendorId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToUser" ADD CONSTRAINT "_PostToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Post"("vendorId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PostToUser" ADD CONSTRAINT "_PostToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
