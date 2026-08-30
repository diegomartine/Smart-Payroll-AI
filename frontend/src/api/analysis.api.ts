import { api } from './axios';
import type { PayrollAnalysis } from '../types/analysis.types';

export const analysisApi = {
  analyzePayroll: (payrollId: number) =>
    api
      .get<PayrollAnalysis>(`/analysis/payroll/${payrollId}`)
      .then((res) => res.data),
};
