/*
  Warnings:

  - Added the required column `staffID` to the `validate_Check_Weight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `statusContinue` to the `validate_Check_Weight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "validate_Check_Weight" ADD COLUMN     "staffID" TEXT NOT NULL,
ADD COLUMN     "statusContinue" TEXT NOT NULL;
