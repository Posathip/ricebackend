/*
  Warnings:

  - You are about to drop the column `NoOld` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `PackingType1` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `PackingType11` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `PackingType12` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `PackingType2` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `Quality1string` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `Quality2string` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `Weightstring` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `bagQuantity` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `carryVessel` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `companyEN` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `currentDate` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `destinationCity` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `exportLicenseNo` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `godown` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `shipperBehalf` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `shippingDate` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `title1string` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `totalGross` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `totalNett` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `totalTare` on the `certificatesheet` table. All the data in the column will be lost.
  - You are about to drop the column `vehicleName` on the `certificatesheet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[certNo]` on the table `certificatesheet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paperNoOriginal]` on the table `certificatesheet` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paperNoCopy]` on the table `certificatesheet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `status` to the `certificatesheet` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Company" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "DataFromGoverment" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "Description" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "LicenseDetail" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "certificatesheet" DROP COLUMN "NoOld",
DROP COLUMN "PackingType1",
DROP COLUMN "PackingType11",
DROP COLUMN "PackingType12",
DROP COLUMN "PackingType2",
DROP COLUMN "Quality1string",
DROP COLUMN "Quality2string",
DROP COLUMN "Weightstring",
DROP COLUMN "bagQuantity",
DROP COLUMN "carryVessel",
DROP COLUMN "companyEN",
DROP COLUMN "currentDate",
DROP COLUMN "destinationCity",
DROP COLUMN "exportLicenseNo",
DROP COLUMN "godown",
DROP COLUMN "shipperBehalf",
DROP COLUMN "shippingDate",
DROP COLUMN "title1string",
DROP COLUMN "totalGross",
DROP COLUMN "totalNett",
DROP COLUMN "totalTare",
DROP COLUMN "vehicleName",
ADD COLUMN     "carryingVessel" TEXT,
ADD COLUMN     "certNo" TEXT,
ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "dateCertificate" TIMESTAMP(3),
ADD COLUMN     "dateOfLoading" TIMESTAMP(3),
ADD COLUMN     "descriptionOfGoodsLine1" TEXT,
ADD COLUMN     "descriptionOfGoodsLine2" TEXT,
ADD COLUMN     "descriptionOfGoodsLine3" TEXT,
ADD COLUMN     "goDown" TEXT,
ADD COLUMN     "marks" TEXT,
ADD COLUMN     "netWeightTON" DOUBLE PRECISION,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "paperNoCopy" TEXT,
ADD COLUMN     "paperNoOriginal" TEXT,
ADD COLUMN     "portName" TEXT,
ADD COLUMN     "qualityLine1" TEXT,
ADD COLUMN     "qualityLine2" TEXT,
ADD COLUMN     "quantity" DOUBLE PRECISION,
ADD COLUMN     "riceType" TEXT,
ADD COLUMN     "shipper" TEXT,
ADD COLUMN     "status" BOOLEAN NOT NULL,
ADD COLUMN     "surveyLocateNameThai" TEXT,
ADD COLUMN     "totalGrossWeight" DOUBLE PRECISION,
ADD COLUMN     "totalNettWeight" DOUBLE PRECISION,
ADD COLUMN     "totalTareWeight" DOUBLE PRECISION,
ADD COLUMN     "unit" TEXT,
ADD COLUMN     "unitKGS_Nett" DOUBLE PRECISION,
ADD COLUMN     "weight" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "extraInvoice" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "orderBill" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "physicalAnalysis" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "sellingLiquids" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "staff" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "surveyName" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "validate_Check_Weight" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- CreateIndex
CREATE UNIQUE INDEX "certificatesheet_certNo_key" ON "certificatesheet"("certNo");

-- CreateIndex
CREATE UNIQUE INDEX "certificatesheet_paperNoOriginal_key" ON "certificatesheet"("paperNoOriginal");

-- CreateIndex
CREATE UNIQUE INDEX "certificatesheet_paperNoCopy_key" ON "certificatesheet"("paperNoCopy");
