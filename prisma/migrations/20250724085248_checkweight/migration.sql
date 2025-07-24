/*
  Warnings:

  - You are about to drop the column `LoadingDetail1` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - You are about to drop the column `Time` on the `validate_Check_Weight` table. All the data in the column will be lost.
  - Added the required column `loadingDetail1` to the `validate_Check_Weight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `time` to the `validate_Check_Weight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());

-- AlterTable
ALTER TABLE "validate_Check_Weight" DROP COLUMN "LoadingDetail1",
DROP COLUMN "Time",
ADD COLUMN     "loadingDetail1" TEXT NOT NULL,
ADD COLUMN     "time" TEXT NOT NULL;
