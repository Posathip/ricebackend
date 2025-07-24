/*
  Warnings:

  - You are about to drop the column `godown` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `shippingDate` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `shippingTime` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `surveyDistrict` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `surveyLocateName` on the `Request` table. All the data in the column will be lost.
  - Added the required column `license` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingDateTime` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surveyLocateNameEng` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `surveyLocateNameThai` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "godown",
DROP COLUMN "shippingDate",
DROP COLUMN "shippingTime",
DROP COLUMN "surveyDistrict",
DROP COLUMN "surveyLocateName",
ADD COLUMN     "license" TEXT NOT NULL,
ADD COLUMN     "shippingDateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "surveyLocateNameEng" TEXT NOT NULL,
ADD COLUMN     "surveyLocateNameThai" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());
