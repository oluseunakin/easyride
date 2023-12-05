/*
  Warnings:

  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderAsUserName_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderAsVendorId_fkey";

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "Chat" (
    "id" INTEGER NOT NULL,
    "messages" JSONB[],

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);
