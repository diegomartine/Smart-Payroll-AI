import { api } from './axios';
import type { Payslip, PayrollPayslipsResult } from '../types/payslip.types';

export const payslipsApi = {
  getByPayrollEmployee: (payrollEmployeeId: number) =>
    api
      .get<Payslip>(`/payslips/payroll-employee/${payrollEmployeeId}`)
      .then((res) => res.data),

  getByPayroll: (payrollId: number) =>
    api
      .get<PayrollPayslipsResult>(`/payslips/payroll/${payrollId}`)
      .then((res) => res.data),
};
