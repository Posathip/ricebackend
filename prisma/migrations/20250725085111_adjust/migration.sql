-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "DataFromGoverment" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "Description" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "LicenseDetail" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "certificatesheet" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "validate_Check_Weight" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now());
