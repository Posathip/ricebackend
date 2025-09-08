/*
  Warnings:

  - You are about to drop the column `packingDetailBags` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `packingDetailKgs` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `packingType` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `remainingWeight` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `remark` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `totalgrossWeight` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `totalnetWeight` on the `validate_Check_Weight` table. All the data in the column will be lost.

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
ALTER TABLE "certificatesheet" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
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
ALTER TABLE "validate_Check_Weight" DROP COLUMN "packingDetailBags",
DROP COLUMN "packingDetailKgs",
DROP COLUMN "packingType",
DROP COLUMN "quantity",
DROP COLUMN "remainingWeight",
DROP COLUMN "remark",
DROP COLUMN "totalgrossWeight",
DROP COLUMN "totalnetWeight",
ADD COLUMN     "grossWeight" DOUBLE PRECISION,
ADD COLUMN     "remainWeight" DOUBLE PRECISION,
ADD COLUMN     "totalGrossWeight" DOUBLE PRECISION,
ADD COLUMN     "totalNetWeight" DOUBLE PRECISION,
ADD COLUMN     "weightPerTon" DOUBLE PRECISION,
ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());
