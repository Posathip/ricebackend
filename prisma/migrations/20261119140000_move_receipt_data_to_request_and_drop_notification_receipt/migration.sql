-- 1) Copy job info from NotificationReceipt (latest receipt per request) into Request before the table is dropped.
--    jobID: only for requests still holding a placeholder number from the backfill (258-382), only numbers no other
--           request owns; when several requests share a number the oldest request keeps it, the others keep their number.
--    staffID / jobName / specialJob: only fill columns that are still NULL; staffID only if the staff still exists.
--    A JSON backup of all receipt rows was taken before this migration (backups/NotificationReceipt-2026-11-19.json).
WITH latest AS (
  SELECT n."requestID",
         (ARRAY_AGG(n."jobID"      ORDER BY n."createdAt" DESC) FILTER (WHERE n."jobID" IS NOT NULL))[1]                               AS job_id,
         (ARRAY_AGG(n."staffID"    ORDER BY n."createdAt" DESC) FILTER (WHERE n."staffID" IS NOT NULL
                                                                     AND EXISTS (SELECT 1 FROM "staff" s WHERE s."staffID" = n."staffID")))[1] AS staff_id,
         (ARRAY_AGG(n."jobName"    ORDER BY n."createdAt" DESC) FILTER (WHERE n."jobName" IS NOT NULL AND n."jobName" <> ''))[1]         AS job_name,
         (ARRAY_AGG(n."specialJob" ORDER BY n."createdAt" DESC) FILTER (WHERE n."specialJob" IS NOT NULL AND n."specialJob" <> ''))[1]   AS special_job
  FROM "NotificationReceipt" n
  GROUP BY n."requestID"
),
job_candidates AS (
  -- only requests still holding a placeholder number from the backfill (258-382),
  -- and only receipt job numbers no other request owns; on a tie the oldest request wins
  SELECT l."requestID", l.job_id,
         ROW_NUMBER() OVER (PARTITION BY l.job_id ORDER BY r."requestDate", r."createdAt", r."requestID") AS rank_in_job
  FROM latest l
  JOIN "Request" r ON r."requestID" = l."requestID"
  WHERE l.job_id IS NOT NULL
    AND r."jobID" BETWEEN 258 AND 382
    AND r."jobID" <> l.job_id
    AND NOT EXISTS (SELECT 1 FROM "Request" o WHERE o."jobID" = l.job_id AND o."requestID" <> l."requestID")
),
plan AS (
  SELECT l."requestID",
         jc.job_id AS new_job_id,
         l.staff_id, l.job_name, l.special_job
  FROM latest l
  LEFT JOIN job_candidates jc ON jc."requestID" = l."requestID" AND jc.rank_in_job = 1
)
UPDATE "Request" AS r
SET "jobID"      = COALESCE(p.new_job_id, r."jobID"),
    "staffID"    = COALESCE(r."staffID", p.staff_id),
    "jobName"    = COALESCE(r."jobName", p.job_name),
    "specialJob" = COALESCE(r."specialJob", p.special_job)
FROM plan p
WHERE r."requestID" = p."requestID";

-- 2) Drop NotificationReceipt (no longer read or written by the application).
-- DropForeignKey
ALTER TABLE "NotificationReceipt" DROP CONSTRAINT "NotificationReceipt_checkWeightID_fkey";

-- DropForeignKey
ALTER TABLE "NotificationReceipt" DROP CONSTRAINT "NotificationReceipt_requestID_fkey";

-- DropForeignKey
ALTER TABLE "NotificationReceipt" DROP CONSTRAINT "NotificationReceipt_descriptionID_fkey";

-- DropTable
DROP TABLE "NotificationReceipt";
