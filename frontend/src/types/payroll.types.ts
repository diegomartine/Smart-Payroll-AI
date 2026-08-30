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

/**
 * Registro de la tabla puente PayrollEmployee, con el empleado incluido
 * tal como lo devuelve GET /payroll/:id/employees.
 *
 * Desde la migración `add_payroll_employee_values`, este modelo también
 * guarda los valores de nómina del período (workedDays, horas extra,
 * bonos, deducciones, etc.) directamente en la fila — ya no son texto
 * libre calculado solo a partir de novedades. IMPORTANTE: el backend NO
 * expone ningún endpoint para editar estos campos manualmente desde el
 * frontend (POST /payroll/:id/employees solo admite `{ employeeId }`).
 * La única forma real de poblarlos es importando el Excel de nómina
 * (`POST /imports/employees`), que hace upsert directo sobre estos
 * campos. El frontend los muestra como solo lectura; no se inventó un
 * endpoint de edición para no salirse de la API real.
 */
export interface PayrollEmployee {
  id: number;
  payrollId: number;
  employeeId: number;
  workedDays: number | null;
  baseSalary: string | null;
  overtimeHours: string;
  overtimeValue: string;
  bonus: string;
  transportAllowance: string;
  otherIncome: string;
  healthDeduction: string;
  pensionDeduction: string;
  otherDeductions: string;
  netSalary: string | null;
  createdAt: string;
  updatedAt: string;
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

/**
 * Respuesta de GET /payroll/employees/:payrollEmployeeId/calculate.
 * Todos los montos ya vienen calculados por el backend (payroll.service.ts
 * -> calculatePayrollEmployee): suma los campos embebidos de
 * PayrollEmployee (salario base o el snapshot guardado, horas extra,
 * bono, auxilio de transporte, otros ingresos, deducciones de salud y
 * pensión, otras deducciones) más las novedades registradas.
 */
export interface PayrollEmployeeCalculation {
  payrollEmployeeId: number;
  employee: {
    id: number;
    employeeCode: string;
    name: string;
  };
  payroll: {
    workedDays: number | null;
    baseSalary: string;
    overtimeHours: string;
    overtimeValue: string;
    bonus: string;
    transportAllowance: string;
    otherIncome: string;
    healthDeduction: string;
    pensionDeduction: string;
    otherDeductions: string;
  };
  novelties: PayrollNovelty[];
  totalEarnings: string;
  totalDeductions: string;
  netPay: string;
}
