-- CreateEnum
CREATE TYPE "PayrollNoveltyType" AS ENUM ('OVERTIME', 'BONUS', 'COMMISSION', 'ALLOWANCE', 'DEDUCTION', 'ABSENCE', 'SICK_LEAVE', 'VACATION', 'OTHER_EARNING', 'OTHER_DEDUCTION');

-- CreateTable
CREATE TABLE "PayrollNovelty" (
    "id" SERIAL NOT NULL,
    "payrollEmployeeId" INTEGER NOT NULL,
    "type" "PayrollNoveltyType" NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(10,2),
    "amount" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PayrollNovelty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PayrollNovelty_payrollEmployeeId_idx" ON "PayrollNovelty"("payrollEmployeeId");

-- AddForeignKey
ALTER TABLE "PayrollNovelty" ADD CONSTRAINT "PayrollNovelty_payrollEmployeeId_fkey" FOREIGN KEY ("payrollEmployeeId") REFERENCES "PayrollEmployee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
