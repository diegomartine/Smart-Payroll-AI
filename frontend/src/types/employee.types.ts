import type { Department } from './department.types';
import type { Position } from './position.types';

export type DocumentType = 'CC' | 'CE' | 'PASSPORT' | 'NIT';

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * Coincide con el modelo `Employee` de prisma/schema.prisma.
 * `baseSalary` viaja como string en el JSON (Prisma.Decimal -> toJSON()).
 * `position`/`department` ya no son texto libre: el backend los devuelve
 * como el objeto completo de la relación (`include: { department, position }`
 * en employees.service.ts).
 */
export interface Employee {
  id: number;
  employeeCode: string;
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  positionId: number;
  departmentId: number;
  position: Position;
  department: Department;
  baseSalary: string;
  hireDate: string;
  employmentStatus: EmploymentStatus;
  createdAt: string;
  updatedAt: string;
}

/** Cuerpo para POST /employees (CreateEmployeeDto). */
export interface CreateEmployeePayload {
  employeeCode: string;
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  departmentId: number;
  positionId: number;
  baseSalary: number;
  hireDate: string;
  employmentStatus?: EmploymentStatus;
}

/** Cuerpo para PATCH /employees/:id (UpdateEmployeeDto = Partial). */
export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;
