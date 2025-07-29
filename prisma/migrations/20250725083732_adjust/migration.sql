/*
  Warnings:

  - You are about to drop the column `exchangeRate` on the `Description` table. All the data in the column will be lost.
  - You are about to drop the column `licenseID` on the `Description` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `Description` table. All the data in the column will be lost.
  - You are about to drop the column `pricePerUnit` on the `Description` table. All the data in the column will be lost.
  - You are about to drop the column `productDescription` on the `Description` table. All the data in the column will be lost.
  - You are about to drop the column `riceTypeExtra` on the `Description` table. All the data in the column will be lost.
  - You are about to drop the column `riceTypeID` on the `Description` table. All the data in the column will be lost.
  - You are about to drop the column `subID` on the `Description` table. All the data in the column will be lost.
  - You are about to drop the column `weightLeft` on the `Description` table. All the data in the column will be lost.
  - You are about to drop the column `license` on the `Request` table. All the data in the column will be lost.
  - Added the required column `licenseNumber` to the `Description` table without a default value. This is not possible if the table is not empty.
  - Added the required column `marker` to the `Description` table without a default value. This is not possible if the table is not empty.
  - Added the required column `riceType` to the `Description` table without a default value. This is not possible if the table is not empty.
  - Added the required column `licenseNumber` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Description" DROP COLUMN "exchangeRate",
DROP COLUMN "licenseID",
DROP COLUMN "logo",
DROP COLUMN "pricePerUnit",
DROP COLUMN "productDescription",
DROP COLUMN "riceTypeExtra",
DROP COLUMN "riceTypeID",
DROP COLUMN "subID",
DROP COLUMN "weightLeft",
ADD COLUMN     "licenseNumber" TEXT NOT NULL,
ADD COLUMN     "marker" TEXT NOT NULL,
ADD COLUMN     "riceType" TEXT NOT NULL,
ALTER COLUMN "quantity" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Request" DROP COLUMN "license",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ADD COLUMN     "licenseNumber" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());
