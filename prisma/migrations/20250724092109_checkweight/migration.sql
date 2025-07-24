-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "validate_Check_Weight" ALTER COLUMN "requestID" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "validate_Check_Weight" ADD CONSTRAINT "validate_Check_Weight_requestID_fkey" FOREIGN KEY ("requestID") REFERENCES "Request"("requestID") ON DELETE RESTRICT ON UPDATE CASCADE;
