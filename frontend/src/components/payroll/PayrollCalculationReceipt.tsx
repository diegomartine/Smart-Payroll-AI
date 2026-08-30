import type { PayrollEmployeeCalculation } from '../../types/payroll.types';
import { formatCOP } from '../../utils/currency';

interface PayrollCalculationReceiptProps {
  calculation: PayrollEmployeeCalculation;
}

/**
 * Presenta el resultado que ya calculó el backend
 * (GET /payroll/employees/:payrollEmployeeId/calculate) como un recibo de
 * nómina. No recalcula nada: solo formatea los valores recibidos.
 *
 * Nota: `totalEarnings` del backend YA incluye el salario base (ver
 * payroll.service.ts -> calculatePayrollEmployee: totalEarnings arranca en
 * `payroll.baseSalary` y luego suma horas extra, bono, auxilio de
 * transporte, otros ingresos y las novedades de tipo devengado). Por eso
 * el salario base se muestra como referencia, no como una fila que se
 * suma aparte de "Total devengado" — evita que la resta visual (Total
 * devengado − Deducciones = Total neto) parezca no cuadrar.
 */
export function PayrollCalculationReceipt({ calculation }: PayrollCalculationReceiptProps) {
  const { payroll } = calculation;
  return (
    <div className="ledger-receipt">
      <div className="ledger-receipt-title">Cálculo de nómina · {calculation.employee.employeeCode}</div>

      {payroll.workedDays !== null && (
        <div className="ledger-row">
          <span className="ledger-row-label">Días trabajados</span>
          <span className="ledger-row-value">{payroll.workedDays}</span>
        </div>
      )}
      <div className="ledger-row">
        <span className="ledger-row-label">Salario base (referencia)</span>
        <span className="ledger-row-value">{formatCOP(payroll.baseSalary)}</span>
      </div>
      <div className="ledger-row">
        <span className="ledger-row-label">Total devengado</span>
        <span className="ledger-row-value">{formatCOP(calculation.totalEarnings)}</span>
      </div>
      <div className="ledger-row">
        <span className="ledger-row-label">− Deducciones</span>
        <span className="ledger-row-value">{formatCOP(calculation.totalDeductions)}</span>
      </div>

      <hr className="ledger-divider" />

      <div className="ledger-total">
        <span>Total neto</span>
        <span className="ledger-total-value">{formatCOP(calculation.netPay)}</span>
      </div>
    </div>
  );
}
