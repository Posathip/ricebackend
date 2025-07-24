/*
  Warnings:

  - You are about to drop the column `licenseID` on the `validate_Check_Weight` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "validate_Check_Weight" DROP COLUMN "licenseID",
ALTER COLUMN "quantity" DROP NOT NULL;
