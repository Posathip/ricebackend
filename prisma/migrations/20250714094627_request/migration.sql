/*
  Warnings:

  - You are about to drop the column `companyID` on the `Request` table. All the data in the column will be lost.
  - Added the required column `companyName` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "companyID",
ADD COLUMN     "companyName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());
