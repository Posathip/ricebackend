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
ALTER TABLE "LicenseDetail" ADD COLUMN     "fullLicenseNumber" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
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
ALTER TABLE "validate_Check_Weight" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());
