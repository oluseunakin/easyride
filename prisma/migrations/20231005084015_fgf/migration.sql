/*
  Warnings:

  - You are about to drop the `_ServiceToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ServiceToUser" DROP CONSTRAINT "_ServiceToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ServiceToUser" DROP CONSTRAINT "_ServiceToUser_B_fkey";

-- DropTable
DROP TABLE "_ServiceToUser";

-- CreateTable
CREATE TABLE "_requests" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_requests_AB_unique" ON "_requests"("A", "B");

-- CreateIndex
CREATE INDEX "_requests_B_index" ON "_requests"("B");

-- AddForeignKey
ALTER TABLE "_requests" ADD CONSTRAINT "_requests_A_fkey" FOREIGN KEY ("A") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_requests" ADD CONSTRAINT "_requests_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
