
-- Add payroll values as nullable first
ALTER TABLE "PayrollEmployee"
ADD COLUMN "baseSalary" DECIMAL(12,2),
ADD COLUMN "bonus" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "healthDeduction" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "netSalary" DECIMAL(12,2),
ADD COLUMN "otherDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "otherIncome" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "overtimeHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN "overtimeValue" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "pensionDeduction" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "transportAllowance" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN "updatedAt" TIMESTAMP(3),
ADD COLUMN "workedDays" INTEGER;

-- Initialize existing PayrollEmployee records
UPDATE "PayrollEmployee"
SET
    "baseSalary" = 0,
    "netSalary" = 0,
    "workedDays" = 0,
    "updatedAt" = CURRENT_TIMESTAMP;

-- Make required fields mandatory
ALTER TABLE "PayrollEmployee"
ALTER COLUMN "baseSalary" SET NOT NULL,
ALTER COLUMN "netSalary" SET NOT NULL,
ALTER COLUMN "workedDays" SET NOT NULL,
ALTER COLUMN "updatedAt" SET NOT NULL;

