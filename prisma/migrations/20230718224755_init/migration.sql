/*
  Warnings:

  - You are about to drop the column `ownerId` on the `Overview` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[logbookId]` on the table `Overview` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `logbookId` to the `Overview` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Overview" DROP CONSTRAINT "Overview_ownerId_fkey";

-- DropIndex
DROP INDEX "Overview_ownerId_key";

-- AlterTable
ALTER TABLE "Overview" DROP COLUMN "ownerId",
ADD COLUMN     "logbookId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Overview_logbookId_key" ON "Overview"("logbookId");

-- AddForeignKey
ALTER TABLE "Overview" ADD CONSTRAINT "Overview_logbookId_fkey" FOREIGN KEY ("logbookId") REFERENCES "Logbook"("id") ON DELETE CASCADE ON UPDATE CASCADE;
