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
ALTER TABLE "validate_Check_Weight" ADD COLUMN     "note" TEXT,
ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- CreateTable
CREATE TABLE "orderBill" (
    "orderBillID" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),

    CONSTRAINT "orderBill_pkey" PRIMARY KEY ("orderBillID")
);

-- CreateTable
CREATE TABLE "physicalAnalysis" (
    "physicalAnalysisID" TEXT NOT NULL,
    "orderBillID" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "companyName" TEXT NOT NULL,
    "physicalAnalysis" BOOLEAN NOT NULL,
    "physicalChemical" TEXT[],
    "totalPrice" DOUBLE PRECISION,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),

    CONSTRAINT "physicalAnalysis_pkey" PRIMARY KEY ("physicalAnalysisID")
);

-- CreateTable
CREATE TABLE "extraInvoice" (
    "extraInvoiceID" TEXT NOT NULL,
    "orderBillID" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "numberSample" TEXT NOT NULL,
    "pricePerUnit" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,
    "note" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),

    CONSTRAINT "extraInvoice_pkey" PRIMARY KEY ("extraInvoiceID")
);

-- CreateTable
CREATE TABLE "sellingLiquids" (
    "sellingLiquidsID" TEXT NOT NULL,
    "orderBillID" TEXT NOT NULL,
    "orderNo" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "liquidsBoolean" BOOLEAN NOT NULL,
    "numberNo1" DOUBLE PRECISION,
    "pricePerUnitNo1" DOUBLE PRECISION,
    "totalPriceNo1" DOUBLE PRECISION,
    "numberNo2" DOUBLE PRECISION,
    "pricePerUnitNo2" DOUBLE PRECISION,
    "totalPriceNo2" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT timezone('Asia/Ho_Chi_Minh', now()),

    CONSTRAINT "sellingLiquids_pkey" PRIMARY KEY ("sellingLiquidsID")
);

-- AddForeignKey
ALTER TABLE "physicalAnalysis" ADD CONSTRAINT "physicalAnalysis_orderBillID_fkey" FOREIGN KEY ("orderBillID") REFERENCES "orderBill"("orderBillID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extraInvoice" ADD CONSTRAINT "extraInvoice_orderBillID_fkey" FOREIGN KEY ("orderBillID") REFERENCES "orderBill"("orderBillID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sellingLiquids" ADD CONSTRAINT "sellingLiquids_orderBillID_fkey" FOREIGN KEY ("orderBillID") REFERENCES "orderBill"("orderBillID") ON DELETE RESTRICT ON UPDATE CASCADE;
