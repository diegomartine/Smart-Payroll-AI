/**
 * Coincide con el modelo `Department` de prisma/schema.prisma.
 * El backend expone el mismo CRUD que Positions en `/departments`.
 */
export interface Department {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Cuerpo para POST /departments (CreateDepartmentDto). */
export interface CreateDepartmentPayload {
  name: string;
  isActive?: boolean;
}

/** Cuerpo para PATCH /departments/:id (UpdateDepartmentDto = Partial). */
export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;
