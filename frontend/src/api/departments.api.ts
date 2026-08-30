import { api } from './axios';
import type { Department } from '../types/department.types';

/**
 * Solo lectura: se usa para poblar el selector de departamento en el
 * formulario de empleados. El backend sí expone CRUD completo en
 * /departments (igual que /positions), pero esta integración no pidió una
 * página de administración de Departments; ver nota en department.types.ts.
 */
export const departmentsApi = {
  listActive: () =>
    api.get<Department[]>('/departments/active').then((res) => res.data),
};
