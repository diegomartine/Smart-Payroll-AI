import { api } from './axios';
import type {
  CreateDepartmentPayload,
  Department,
  UpdateDepartmentPayload,
} from '../types/department.types';

export const departmentsApi = {
  list: () => api.get<Department[]>('/departments').then((res) => res.data),

  listActive: () =>
    api.get<Department[]>('/departments/active').then((res) => res.data),

  getById: (id: number) =>
    api.get<Department>(`/departments/${id}`).then((res) => res.data),

  create: (payload: CreateDepartmentPayload) =>
    api.post<Department>('/departments', payload).then((res) => res.data),

  update: (id: number, payload: UpdateDepartmentPayload) =>
    api.patch<Department>(`/departments/${id}`, payload).then((res) => res.data),

  deactivate: (id: number) =>
    api
      .patch<Department>(`/departments/${id}/deactivate`)
      .then((res) => res.data),
};
