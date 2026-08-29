import type { DocumentType, EmploymentStatus } from '../types/employee.types';
import type { PayrollNoveltyType, PayrollStatus } from '../types/payroll.types';

export const payrollStatusLabels: Record<PayrollStatus, string> = {
  DRAFT: 'Borrador',
  PROCESSING: 'En proceso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

export const payrollStatusBadgeClass: Record<PayrollStatus, string> = {
  DRAFT: 'badge-slate',
  PROCESSING: 'badge-amber',
  COMPLETED: 'badge-green',
  CANCELLED: 'badge-red',
};

export const employmentStatusLabels: Record<EmploymentStatus, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  SUSPENDED: 'Suspendido',
};

export const employmentStatusBadgeClass: Record<EmploymentStatus, string> = {
  ACTIVE: 'badge-green',
  INACTIVE: 'badge-slate',
  SUSPENDED: 'badge-red',
};

export const documentTypeLabels: Record<DocumentType, string> = {
  CC: 'Cédula de ciudadanía',
  CE: 'Cédula de extranjería',
  PASSPORT: 'Pasaporte',
  NIT: 'NIT',
};

export const noveltyTypeLabels: Record<PayrollNoveltyType, string> = {
  OVERTIME: 'Horas extra',
  BONUS: 'Bonificación',
  COMMISSION: 'Comisión',
  ALLOWANCE: 'Auxilio',
  DEDUCTION: 'Deducción',
  ABSENCE: 'Ausencia',
  SICK_LEAVE: 'Incapacidad',
  VACATION: 'Vacaciones',
  OTHER_EARNING: 'Otro devengado',
  OTHER_DEDUCTION: 'Otra deducción',
};

export const isEarningNovelty = (type: PayrollNoveltyType): boolean =>
  type === 'OVERTIME' ||
  type === 'BONUS' ||
  type === 'COMMISSION' ||
  type === 'ALLOWANCE' ||
  type === 'OTHER_EARNING';

export const validPayrollStatusTransitions: Record<PayrollStatus, PayrollStatus[]> = {
  DRAFT: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};
