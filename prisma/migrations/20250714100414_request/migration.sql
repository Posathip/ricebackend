/*
  Warnings:

  - You are about to drop the column `legacyRequestID` on the `Request` table. All the data in the column will be lost.
  - You are about to drop the column `tel` on the `Request` table. All the data in the column will be lost.
  - Added the required column `surveySubDistrict` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telDebtor` to the `Request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telInspector` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Request" DROP COLUMN "legacyRequestID",
DROP COLUMN "tel",
ADD COLUMN     "surveySubDistrict" TEXT NOT NULL,
ADD COLUMN     "telDebtor" TEXT NOT NULL,
ADD COLUMN     "telInspector" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now()),
ALTER COLUMN "updatedAt" SET DEFAULT timezone('Asia/Ho_Chi_Minh', now());
