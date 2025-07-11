/*
  Warnings:

  - A unique constraint covering the columns `[licenseNumber]` on the table `DataFromGoverment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- CreateIndex
CREATE UNIQUE INDEX "DataFromGoverment_licenseNumber_key" ON "DataFromGoverment"("licenseNumber");
