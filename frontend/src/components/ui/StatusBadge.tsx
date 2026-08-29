import type { EmploymentStatus } from '../../types/employee.types';
import type { PayrollStatus } from '../../types/payroll.types';
import {
  employmentStatusBadgeClass,
  employmentStatusLabels,
  payrollStatusBadgeClass,
  payrollStatusLabels,
} from '../../utils/labels';

export function PayrollStatusBadge({ status }: { status: PayrollStatus }) {
  return (
    <span className={`badge ${payrollStatusBadgeClass[status]}`}>
      {payrollStatusLabels[status]}
    </span>
  );
}

export function EmploymentStatusBadge({ status }: { status: EmploymentStatus }) {
  return (
    <span className={`badge ${employmentStatusBadgeClass[status]}`}>
      {employmentStatusLabels[status]}
    </span>
  );
}
