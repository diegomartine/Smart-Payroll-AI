/*
  Warnings:

  - You are about to alter the column `baseSalary` on the `Employee` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "baseSalary" SET DATA TYPE DECIMAL(12,2);
