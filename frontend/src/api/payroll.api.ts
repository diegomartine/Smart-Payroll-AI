import { api } from './axios';
import type {
  CreatePayrollPayload,
  Payroll,
  PayrollEmployee,
  PayrollEmployeeCalculation,
  PayrollStatus,
  UpdatePayrollPayload,
} from '../types/payroll.types';

export const payrollApi = {
  list: () => api.get<Payroll[]>('/payroll').then((res) => res.data),

  getById: (id: number) =>
    api.get<Payroll>(`/payroll/${id}`).then((res) => res.data),

  create: (payload: CreatePayrollPayload) =>
    api.post<Payroll>('/payroll', payload).then((res) => res.data),

  update: (id: number, payload: UpdatePayrollPayload) =>
    api.patch<Payroll>(`/payroll/${id}`, payload).then((res) => res.data),

  remove: (id: number) =>
    api.delete<Payroll>(`/payroll/${id}`).then((res) => res.data),

  updateStatus: (id: number, status: PayrollStatus) =>
    api
      .patch<Payroll>(`/payroll/${id}/status`, { status })
      .then((res) => res.data),

  // Empleados asignados a una nómina
  listEmployees: (payrollId: number) =>
    api
      .get<PayrollEmployee[]>(`/payroll/${payrollId}/employees`)
      .then((res) => res.data),

  addEmployee: (payrollId: number, employeeId: number) =>
    api
      .post<PayrollEmployee>(`/payroll/${payrollId}/employees`, { employeeId })
      .then((res) => res.data),

  removeEmployee: (payrollId: number, employeeId: number) =>
    api
      .delete(`/payroll/${payrollId}/employees/${employeeId}`)
      .then((res) => res.data),

  // El backend calcula por empleado dentro de la nómina; no existe un
  // endpoint que devuelva el total agregado de toda la nómina de una vez
  // (ver README del frontend, sección "Endpoints no disponibles").
  calculateEmployee: (payrollEmployeeId: number) =>
    api
      .get<PayrollEmployeeCalculation>(
        `/payroll/employees/${payrollEmployeeId}/calculate`,
      )
      .then((res) => res.data),
};
