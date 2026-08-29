import { api } from './axios';
import type {
  CreatePayrollNoveltyPayload,
  PayrollNovelty,
  UpdatePayrollNoveltyPayload,
} from '../types/payroll.types';

export const noveltiesApi = {
  listByPayrollEmployee: (payrollId: number, employeeId: number) =>
    api
      .get<PayrollNovelty[]>(
        `/payroll/${payrollId}/employees/${employeeId}/novelties`,
      )
      .then((res) => res.data),

  create: (
    payrollId: number,
    employeeId: number,
    payload: CreatePayrollNoveltyPayload,
  ) =>
    api
      .post<PayrollNovelty>(
        `/payroll/${payrollId}/employees/${employeeId}/novelties`,
        payload,
      )
      .then((res) => res.data),

  update: (noveltyId: number, payload: UpdatePayrollNoveltyPayload) =>
    api
      .patch<PayrollNovelty>(`/payroll/novelties/${noveltyId}`, payload)
      .then((res) => res.data),

  remove: (noveltyId: number) =>
    api.delete(`/payroll/novelties/${noveltyId}`).then((res) => res.data),
};
