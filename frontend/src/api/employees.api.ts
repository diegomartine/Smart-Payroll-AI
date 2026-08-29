import { api } from './axios';
import type {
  CreateEmployeePayload,
  Employee,
  UpdateEmployeePayload,
} from '../types/employee.types';

export const employeesApi = {
  list: () => api.get<Employee[]>('/employees').then((res) => res.data),

  getById: (id: number) =>
    api.get<Employee>(`/employees/${id}`).then((res) => res.data),

  create: (payload: CreateEmployeePayload) =>
    api.post<Employee>('/employees', payload).then((res) => res.data),

  update: (id: number, payload: UpdateEmployeePayload) =>
    api.patch<Employee>(`/employees/${id}`, payload).then((res) => res.data),

  remove: (id: number) =>
    api.delete<Employee>(`/employees/${id}`).then((res) => res.data),
};
