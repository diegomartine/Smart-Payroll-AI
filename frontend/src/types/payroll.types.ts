import type { Employee } from './employee.types';

export type PayrollStatus = 'DRAFT' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export type PayrollNoveltyType =
  | 'OVERTIME'
  | 'BONUS'
  | 'COMMISSION'
  | 'ALLOWANCE'
  | 'DEDUCTION'
  | 'ABSENCE'
  | 'SICK_LEAVE'
  | 'VACATION'
  | 'OTHER_EARNING'
  | 'OTHER_DEDUCTION';

/** Tipos de novedad que el backend suma como devengado en el cálculo. */
export const EARNING_NOVELTY_TYPES: PayrollNoveltyType[] = [
  'OVERTIME',
  'BONUS',
  'COMMISSION',
  'ALLOWANCE',
  'OTHER_EARNING',
];

/** Coincide con el modelo `Payroll` de prisma/schema.prisma. */
export interface Payroll {
  id: number;
  period: string;
  startDate: string;
  endDate: string;
  status: PayrollStatus;
  createdAt: string;
  updatedAt: string;
}

/** Cuerpo para POST /payroll (CreatePayrollDto). */
export interface CreatePayrollPayload {
  period: string;
  startDate: string;
  endDate: string;
}

/** Cuerpo para PATCH /payroll/:id (UpdatePayrollDto = Partial). */
export type UpdatePayrollPayload = Partial<CreatePayrollPayload>;

/** Registro de la tabla puente PayrollEmployee, con el empleado incluido
 *  tal como lo devuelve GET /payroll/:id/employees. */
export interface PayrollEmployee {
  id: number;
  payrollId: number;
  employeeId: number;
  createdAt: string;
  employee: Employee;
}

/** Coincide con el modelo `PayrollNovelty`. `quantity`/`amount` viajan
 *  como string (Prisma.Decimal). */
export interface PayrollNovelty {
  id: number;
  payrollEmployeeId: number;
  type: PayrollNoveltyType;
  description: string | null;
  quantity: string | null;
  amount: string;
  createdAt: string;
  updatedAt: string;
}

/** Cuerpo para POST /payroll/:id/employees/:employeeId/novelties. */
export interface CreatePayrollNoveltyPayload {
  type: PayrollNoveltyType;
  description?: string;
  quantity?: number;
  amount: number;
}

export type UpdatePayrollNoveltyPayload = Partial<CreatePayrollNoveltyPayload>;

/** Respuesta de GET /payroll/employees/:payrollEmployeeId/calculate.
 *  Todos los montos ya vienen calculados por el backend. */
export interface PayrollEmployeeCalculation {
  payrollEmployeeId: number;
  employee: {
    id: number;
    employeeCode: string;
    name: string;
  };
  baseSalary: string;
  totalEarnings: string;
  totalDeductions: string;
  netPay: string;
}
