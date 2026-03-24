/*
  Warnings:

  - You are about to drop the column `agentId` on the `property` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `property` table without a default value. This is not possible if the table is not empty.
  - Made the column `type` on table `property` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "property" DROP COLUMN "agentId",
ADD COLUMN     "ownerId" TEXT NOT NULL,
ALTER COLUMN "type" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
