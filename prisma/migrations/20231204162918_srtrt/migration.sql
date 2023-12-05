/*
  Warnings:

  - You are about to drop the column `commentorAsUserId` on the `Comment` table. All the data in the column will be lost.
  - You are about to drop the column `commentorAsVendorId` on the `Comment` table. All the data in the column will be lost.
  - Added the required column `commentorId` to the `Comment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commentorAsUserId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_commentorAsVendorId_fkey";

-- AlterTable
ALTER TABLE "Comment" DROP COLUMN "commentorAsUserId",
DROP COLUMN "commentorAsVendorId",
ADD COLUMN     "commentorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_commentorId_fkey" FOREIGN KEY ("commentorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
