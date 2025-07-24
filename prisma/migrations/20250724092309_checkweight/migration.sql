/*
  Warnings:

  - Added the required column `descriptionID` to the `validate_Check_Weight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "validate_Check_Weight" ADD COLUMN     "descriptionID" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "validate_Check_Weight" ADD CONSTRAINT "validate_Check_Weight_descriptionID_fkey" FOREIGN KEY ("descriptionID") REFERENCES "Description"("descriptionID") ON DELETE RESTRICT ON UPDATE CASCADE;
