-- DropForeignKey
ALTER TABLE "Media" DROP CONSTRAINT "Media_commentId_fkey";

-- AlterTable
ALTER TABLE "Media" ALTER COLUMN "commentId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
