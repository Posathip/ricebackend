-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "jobID" INTEGER,
ADD COLUMN     "jobName" TEXT,
ADD COLUMN     "staffID" TEXT,
ADD COLUMN     "startTimeOperation" TIMESTAMP(3),
ADD COLUMN     "stopTimeOperation" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "Request_jobID_key" ON "Request"("jobID");
