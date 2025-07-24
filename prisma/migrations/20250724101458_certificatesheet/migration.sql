/*
  Warnings:

  - The primary key for the `certificatesheet` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `CertificatesheetID` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `License` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `ShipperBehalf` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `TotalGross` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `TotalNett` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `TotalTare` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `logo` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `subID` on the `certificatesheet` table. All the data in the column will be lost.
  - The required column `certificateSheetID` was added to the `certificatesheet` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "certificatesheet" DROP CONSTRAINT "certificatesheet_pkey",
DROP COLUMN "CertificatesheetID",
DROP COLUMN "License",
DROP COLUMN "ShipperBehalf",
DROP COLUMN "TotalGross",
DROP COLUMN "TotalNett",
DROP COLUMN "TotalTare",
DROP COLUMN "logo",
DROP COLUMN "subID",
ADD COLUMN     "carryVessel" TEXT,
ADD COLUMN     "certificateSheetID" TEXT NOT NULL,
ADD COLUMN     "destination" TEXT,
ADD COLUMN     "exportLicenseNo" TEXT,
ADD COLUMN     "license" TEXT,
ADD COLUMN     "shipperBehalf" TEXT,
ADD COLUMN     "totalGross" TEXT,
ADD COLUMN     "totalNett" DOUBLE PRECISION,
ADD COLUMN     "totalTare" TEXT,
ALTER COLUMN "No" DROP NOT NULL,
ALTER COLUMN "NoOld" DROP NOT NULL,
ALTER COLUMN "PackingType1" DROP NOT NULL,
ALTER COLUMN "PackingType11" DROP NOT NULL,
ALTER COLUMN "PackingType12" DROP NOT NULL,
ALTER COLUMN "PackingType2" DROP NOT NULL,
ALTER COLUMN "Quality1string" DROP NOT NULL,
ALTER COLUMN "Quality2string" DROP NOT NULL,
ALTER COLUMN "Weightstring" DROP NOT NULL,
ALTER COLUMN "bagQuantity" DROP NOT NULL,
ALTER COLUMN "companyEN" DROP NOT NULL,
ALTER COLUMN "currentDate" DROP NOT NULL,
ALTER COLUMN "destinationCity" DROP NOT NULL,
ALTER COLUMN "godown" DROP NOT NULL,
ALTER COLUMN "shippingDate" DROP NOT NULL,
ALTER COLUMN "shippingPort" DROP NOT NULL,
ADD CONSTRAINT "certificatesheet_pkey" PRIMARY KEY ("certificateSheetID");
