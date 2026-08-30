import { useEffect, useState } from 'react';
import { payrollApi } from '../../api/payroll.api';
import type { PayrollEmployee } from '../../types/payroll.types';
import { formatCOP } from '../../utils/currency';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';
import { Loading } from '../ui/Loading';

interface PayrollSummaryCardProps {
  payrollEmployees: PayrollEmployee[];
}

interface Totals {
  baseSalary: number;
  totalEarnings: number;
  totalDeductions: number;
  netPay: number;
}

/**
 * El backend solo expone el cálculo por empleado
 * (GET /payroll/employees/:payrollEmployeeId/calculate); no existe un
 * endpoint que devuelva el total agregado de toda la nómina. Este
 * componente suma los valores YA calculados por el backend para cada
 * empleado — no aplica ninguna regla de nómina propia.
 */
export function PayrollSummaryCard({ payrollEmployees }: PayrollSummaryCardProps) {
  const { showToast } = useToast();
  const [totals, setTotals] = useState<Totals | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (payrollEmployees.length === 0) {
      setTotals({ baseSalary: 0, totalEarnings: 0, totalDeductions: 0, netPay: 0 });
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    Promise.all(payrollEmployees.map((pe) => payrollApi.calculateEmployee(pe.id)))
      .then((results) => {
        if (!active) return;
        const sum = results.reduce<Totals>(
          (acc, r) => ({
            baseSalary: acc.baseSalary + Number(r.payroll.baseSalary),
            totalEarnings: acc.totalEarnings + Number(r.totalEarnings),
            totalDeductions: acc.totalDeductions + Number(r.totalDeductions),
            netPay: acc.netPay + Number(r.netPay),
          }),
          { baseSalary: 0, totalEarnings: 0, totalDeductions: 0, netPay: 0 },
        );
        setTotals(sum);
      })
      .catch((err) => active && showToast(getErrorMessage(err), 'error'))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payrollEmployees]);

  if (loading) return <Loading label="Calculando resumen…" />;
  if (!totals) return null;

  return (
    <div className="ledger-receipt">
      <div className="ledger-receipt-title">Resumen de la nómina · {payrollEmployees.length} empleado(s)</div>

      <div className="ledger-row">
        <span className="ledger-row-label">Salarios base (referencia)</span>
        <span className="ledger-row-value">{formatCOP(totals.baseSalary)}</span>
      </div>
      <div className="ledger-row">
        <span className="ledger-row-label">Total devengado</span>
        <span className="ledger-row-value">{formatCOP(totals.totalEarnings)}</span>
      </div>
      <div className="ledger-row">
        <span className="ledger-row-label">− Deducciones</span>
        <span className="ledger-row-value">{formatCOP(totals.totalDeductions)}</span>
      </div>

      <hr className="ledger-divider" />

      <div className="ledger-total">
        <span>Total neto</span>
        <span className="ledger-total-value">{formatCOP(totals.netPay)}</span>
      </div>
    </div>
  );
}
