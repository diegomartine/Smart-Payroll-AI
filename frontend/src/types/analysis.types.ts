/**
 * Respuesta de GET /analysis/payroll/:id (analysis.service.ts).
 *
 * No es un análisis de IA: son cifras calculadas con aritmética simple
 * (sumas, comparaciones) sobre los datos reales de la nómina. Se presenta
 * en el frontend como "análisis de nómina", nunca como "IA", porque el
 * backend actual no genera nada con un modelo de lenguaje.
 *
 * Cuando la nómina no tiene empleados, el backend devuelve una forma
 * reducida (sin `highestPaidEmployee`, `factors`, `analysis` ni
 * `employees`) — de ahí la unión de dos formas.
 */
export interface PayrollAnalysisFactor {
  factor: string;
  amount: number;
}

export interface PayrollAnalysisEmployee {
  payrollEmployeeId: number;
  employeeCode: string;
  name: string;
  netSalary: number;
  earnings: {
    baseSalary: number;
    overtimeValue: number;
    bonus: number;
    transportAllowance: number;
    otherIncome: number;
    positiveNovelties: number;
  };
  deductions: {
    healthDeduction: number;
    pensionDeduction: number;
    otherDeductions: number;
    negativeNovelties: number;
  };
  totalEarnings: number;
  totalDeductions: number;
  noveltiesCount: number;
}

export interface PayrollAnalysisEmpty {
  payrollId: number;
  period: string;
  employeesCount: 0;
  totalPayroll: 0;
  message: string;
}

export interface PayrollAnalysisFull {
  payrollId: number;
  period: string;
  employeesCount: number;
  totalPayroll: number;
  highestPaidEmployee: {
    payrollEmployeeId: number;
    employeeCode: string;
    name: string;
    netSalary: number;
  };
  factors: PayrollAnalysisFactor[];
  analysis: string;
  employees: PayrollAnalysisEmployee[];
}

export type PayrollAnalysis = PayrollAnalysisEmpty | PayrollAnalysisFull;

/** Type guard: distingue la forma completa de la forma "sin empleados". */
export function isFullAnalysis(
  analysis: PayrollAnalysis,
): analysis is PayrollAnalysisFull {
  return 'highestPaidEmployee' in analysis;
}
