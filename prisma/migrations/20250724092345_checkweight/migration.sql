-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "validate_Check_Weight" ALTER COLUMN "bagQuantity" DROP NOT NULL,
ALTER COLUMN "jobID" DROP NOT NULL,
ALTER COLUMN "netWeight" DROP NOT NULL,
ALTER COLUMN "riceTypeID" DROP NOT NULL,
ALTER COLUMN "shippingDate" DROP NOT NULL,
ALTER COLUMN "loadingDetail1" DROP NOT NULL,
ALTER COLUMN "time" DROP NOT NULL,
ALTER COLUMN "staffID" DROP NOT NULL,
ALTER COLUMN "statusContinue" DROP NOT NULL,
ALTER COLUMN "companyName" DROP NOT NULL;
