export type DocumentType = 'CC' | 'CE' | 'PASSPORT' | 'NIT';

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/**
 * Coincide con el modelo `Employee` de prisma/schema.prisma.
 * `baseSalary` viaja como string en el JSON (Prisma.Decimal -> toJSON()).
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
  position: string;
  department: string;
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
  position: string;
  department: string;
  baseSalary: number;
  hireDate: string;
  employmentStatus?: EmploymentStatus;
}

/** Cuerpo para PATCH /employees/:id (UpdateEmployeeDto = Partial). */
export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;
