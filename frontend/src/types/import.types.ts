/**
 * Respuesta real de POST /imports/employees (imports.service.ts).
 * Un solo Excel con 3 hojas (Employees, Payroll, Novelties) crea/actualiza
 * empleados, la nómina del período y reemplaza sus novedades en una sola
 * operación transaccional.
 */
export interface ImportEmployeesResult {
  message: string;
  fileName: string;
  payrollPeriod: string;
  payrollId: number;
  employeesImported: number;
  payrollEmployeesImported: number;
  noveltiesImported: number;
}
