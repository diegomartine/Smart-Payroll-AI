-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Position_name_key" ON "Position"("name");

-- Add nullable columns first
ALTER TABLE "Employee"
ADD COLUMN "departmentId" INTEGER,
ADD COLUMN "positionId" INTEGER;

-- Migrate existing department values
INSERT INTO "Department" ("name")
SELECT DISTINCT "department"
FROM "Employee"
WHERE "department" IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

-- Migrate existing position values
INSERT INTO "Position" ("name")
SELECT DISTINCT "position"
FROM "Employee"
WHERE "position" IS NOT NULL
ON CONFLICT ("name") DO NOTHING;

-- Assign department IDs to existing employees
UPDATE "Employee" e
SET "departmentId" = d."id"
FROM "Department" d
WHERE e."department" = d."name";

-- Assign position IDs to existing employees
UPDATE "Employee" e
SET "positionId" = p."id"
FROM "Position" p
WHERE e."position" = p."name";

-- Make the new relationships mandatory
ALTER TABLE "Employee"
ALTER COLUMN "departmentId" SET NOT NULL,
ALTER COLUMN "positionId" SET NOT NULL;

-- Remove old text columns
ALTER TABLE "Employee"
DROP COLUMN "department",
DROP COLUMN "position";

-- CreateForeignKey
ALTER TABLE "Employee"
ADD CONSTRAINT "Employee_positionId_fkey"
FOREIGN KEY ("positionId") REFERENCES "Position"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateForeignKey
ALTER TABLE "Employee"
ADD CONSTRAINT "Employee_departmentId_fkey"
FOREIGN KEY ("departmentId") REFERENCES "Department"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;