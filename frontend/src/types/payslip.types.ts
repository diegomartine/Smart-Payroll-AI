import type { DocumentType } from './employee.types';
import type { PayrollNoveltyType } from './payroll.types';

/** Novedad tal como la devuelve payslips.service.ts (montos ya como number). */
export interface PayslipNovelty {
  id: number;
  type: PayrollNoveltyType;
  description: string | null;
  quantity: number | null;
  amount: number;
  createdAt: string;
}

/**
 * Respuesta de GET /payslips/payroll-employee/:id (desprendible individual).
 * Todos los montos vienen como `number` (el backend ya hizo `Number(...)`),
 * a diferencia del cálculo de payroll que devuelve strings.
 */
export interface Payslip {
  payrollEmployeeId: number;
  period: string;
  employee: {
    id: number;
    employeeCode: string;
    documentType: DocumentType;
    documentNumber: string;
    name: string;
    email: string | null;
    position: string;
    department: string;
  };
  payroll: {
    workedDays: number;
    baseSalary: number;
    overtimeHours: number;
  };
  earnings: {
    baseSalary: number;
    overtimeValue: number;
    bonus: number;
    transportAllowance: number;
    otherIncome: number;
    /** Solo informativo: no se suma de nuevo al total (ver payslips.service.ts). */
    noveltyEarnings: number;
  };
  deductions: {
    healthDeduction: number;
    pensionDeduction: number;
    otherDeductions: number;
    /** Solo informativo: no se suma de nuevo al total. */
    noveltyDeductions: number;
  };
  novelties: PayslipNovelty[];
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
}

/** Respuesta de GET /payslips/payroll/:id (todos los desprendibles de la nómina). */
export interface PayrollPayslipsResult {
  payrollId: number;
  period: string;
  employeesCount: number;
  payslips: Payslip[];
}
