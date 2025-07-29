/*
  Warnings:

  - You are about to drop the column `bagQuantity` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `grossWeight` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `loadingDetail1` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `netWeight` on the `validate_Check_Weight` table. All the data in the column will be lost.

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
ALTER TABLE "validate_Check_Weight" DROP COLUMN "bagQuantity",
DROP COLUMN "grossWeight",
DROP COLUMN "loadingDetail1",
DROP COLUMN "netWeight",
ADD COLUMN     "loadingDetails" TEXT,
ADD COLUMN     "nettWeight" DOUBLE PRECISION,
ADD COLUMN     "noOfBags" DOUBLE PRECISION,
ADD COLUMN     "packingDetailBags" DOUBLE PRECISION,
ADD COLUMN     "packingDetailKgs" DOUBLE PRECISION,
ADD COLUMN     "packingType" TEXT,
ADD COLUMN     "remainingWeight" DOUBLE PRECISION,
ADD COLUMN     "remark1" TEXT,
ADD COLUMN     "remark2" TEXT,
ADD COLUMN     "remark3" TEXT,
ADD COLUMN     "remark4" TEXT,
ADD COLUMN     "supplierName" TEXT,
ADD COLUMN     "totalTareWeight" DOUBLE PRECISION,
ADD COLUMN     "totalgrossWeight" DOUBLE PRECISION,
ADD COLUMN     "totalnetWeight" DOUBLE PRECISION,
ADD COLUMN     "vesselName" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());
