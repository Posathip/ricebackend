-- Backfill Request."jobID" for every request that has none.
-- Numbers continue after the highest job number already used anywhere
-- (validate_Check_Weight, NotificationReceipt, Request), so they never collide with existing job numbers.
-- Order: requestDate, then createdAt, then requestID (deterministic).
-- Runs after 20261119120000_add_request_job_fields. Safe to re-run: only touches rows where "jobID" IS NULL.

WITH base AS (
  SELECT GREATEST(
    COALESCE((SELECT MAX("jobID") FROM "validate_Check_Weight"), 0),
    COALESCE((SELECT MAX("jobID") FROM "NotificationReceipt"), 0),
    COALESCE((SELECT MAX("jobID") FROM "Request"), 0)
  ) AS max_job_id
),
numbered AS (
  SELECT "requestID",
         ROW_NUMBER() OVER (ORDER BY "requestDate", "createdAt", "requestID") AS row_no
  FROM "Request"
  WHERE "jobID" IS NULL
)
UPDATE "Request" AS r
SET "jobID" = base.max_job_id + numbered.row_no
FROM numbered, base
WHERE r."requestID" = numbered."requestID";
