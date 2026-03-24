-- DropForeignKey
ALTER TABLE "image" DROP CONSTRAINT "image_propertyId_fkey";

-- DropForeignKey
ALTER TABLE "property" DROP CONSTRAINT "property_ownerId_fkey";

-- AddForeignKey
ALTER TABLE "property" ADD CONSTRAINT "property_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "image" ADD CONSTRAINT "image_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "property"("id") ON DELETE CASCADE ON UPDATE CASCADE;
