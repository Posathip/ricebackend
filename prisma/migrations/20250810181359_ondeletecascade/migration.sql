-- DropForeignKey
ALTER TABLE "extraInvoice" DROP CONSTRAINT "extraInvoice_orderBillID_fkey";

-- DropForeignKey
ALTER TABLE "physicalAnalysis" DROP CONSTRAINT "physicalAnalysis_orderBillID_fkey";

-- DropForeignKey
ALTER TABLE "sellingLiquids" DROP CONSTRAINT "sellingLiquids_orderBillID_fkey";

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
ALTER TABLE "validate_Check_Weight" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AddForeignKey
ALTER TABLE "physicalAnalysis" ADD CONSTRAINT "physicalAnalysis_orderBillID_fkey" FOREIGN KEY ("orderBillID") REFERENCES "orderBill"("orderBillID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraInvoice" ADD CONSTRAINT "extraInvoice_orderBillID_fkey" FOREIGN KEY ("orderBillID") REFERENCES "orderBill"("orderBillID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sellingLiquids" ADD CONSTRAINT "sellingLiquids_orderBillID_fkey" FOREIGN KEY ("orderBillID") REFERENCES "orderBill"("orderBillID") ON DELETE CASCADE ON UPDATE CASCADE;
