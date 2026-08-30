/**
 * Coincide con el modelo `Department` de prisma/schema.prisma.
 *
 * El backend expone el mismo CRUD que Positions (`/departments`), pero
 * este frontend solo lo consume en modo lectura (`findActive`) para
 * alimentar el selector de departamento en el formulario de empleados:
 * el enunciado de esta integración pidió explícitamente una página para
 * "Positions", no para Departments. Si más adelante se necesita una
 * página de administración de Departments, el backend ya la soporta
 * (mismos endpoints que Positions) y solo faltaría el CRUD en frontend.
 */
export interface Department {
  id: number;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
