import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, Wallet, Trophy, Sparkles } from 'lucide-react';
import { payrollApi } from '../../api/payroll.api';
import { analysisApi } from '../../api/analysis.api';
import type { Payroll } from '../../types/payroll.types';
import { isFullAnalysis, type PayrollAnalysis } from '../../types/analysis.types';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCOP } from '../../utils/currency';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';

export function AnalysisPage() {
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const payrollIdParam = searchParams.get('payrollId');

  const [payrolls, setPayrolls] = useState<Payroll[] | null>(null);
  const [analysis, setAnalysis] = useState<PayrollAnalysis | null>(null);
  const [loadingPayrolls, setLoadingPayrolls] = useState(true);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  useEffect(() => {
    payrollApi
      .list()
      .then(setPayrolls)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoadingPayrolls(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!payrollIdParam) {
      setAnalysis(null);
      return;
    }
    setLoadingAnalysis(true);
    analysisApi
      .analyzePayroll(Number(payrollIdParam))
      .then(setAnalysis)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoadingAnalysis(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payrollIdParam]);

  return (
    <div className="stack">
      <PageHeader
        title="Análisis de nómina"
        description="Cifras calculadas sobre los datos reales de la nómina (no es un análisis de IA)."
      />

      <div className="card card-pad" style={{ maxWidth: 420 }}>
        <div className="field">
          <label htmlFor="payroll-select">Selecciona una nómina</label>
          <select
            id="payroll-select"
            className="input"
            value={payrollIdParam ?? ''}
            disabled={loadingPayrolls}
            onChange={(e) => {
              const value = e.target.value;
              setSearchParams(value ? { payrollId: value } : {});
            }}
          >
            <option value="">
              {loadingPayrolls ? 'Cargando nóminas…' : 'Selecciona…'}
            </option>
            {payrolls?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.period}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loadingAnalysis && <Loading label="Calculando análisis…" />}

      {!loadingAnalysis && !analysis && payrollIdParam === null && (
        <EmptyState
          icon={<Sparkles size={20} />}
          title="Selecciona una nómina"
          description="Elige un período arriba para ver su análisis."
        />
      )}

      {!loadingAnalysis && analysis && !isFullAnalysis(analysis) && (
        <EmptyState icon={<Users size={20} />} title="Sin datos suficientes" description={analysis.message} />
      )}

      {!loadingAnalysis && analysis && isFullAnalysis(analysis) && (
        <div className="stack">
          <div className="stats-grid">
            <StatCard icon={<Users size={18} />} label="Empleados" value={analysis.employeesCount} />
            <StatCard
              icon={<Wallet size={18} />}
              label="Total nómina"
              value={formatCOP(analysis.totalPayroll)}
            />
            <StatCard icon={<Trophy size={18} />} label="Mayor pago" value={analysis.highestPaidEmployee.name} />
            <StatCard
              icon={<Wallet size={18} />}
              label="Neto mayor pago"
              value={formatCOP(analysis.highestPaidEmployee.netSalary)}
            />
          </div>

          <div className="grid-2">
            <div className="card card-pad stack" style={{ gap: 12 }}>
              <span className="section-title" style={{ marginBottom: 0 }}>
                Factores del mayor pago
              </span>
              {analysis.factors.length === 0 ? (
                <p className="text-muted" style={{ fontSize: 13 }}>
                  No hay factores adicionales sobre el salario base.
                </p>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Factor</th>
                        <th className="text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.factors.map((f) => (
                        <tr key={f.factor}>
                          <td className="cell-primary">{f.factor}</td>
                          <td className="mono text-right">{formatCOP(f.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="ledger-receipt" style={{ background: 'var(--navy-950)' }}>
              <div className="ledger-receipt-title">Análisis</div>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13.5, lineHeight: 1.6, color: '#e7ecf4' }}>
                {analysis.analysis}
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <span className="card-title">Detalle por empleado</span>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Nombre</th>
                    <th className="text-right">Devengado</th>
                    <th className="text-right">Deducciones</th>
                    <th className="text-right">Neto</th>
                    <th className="text-right">Novedades</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.employees.map((e) => (
                    <tr key={e.payrollEmployeeId}>
                      <td className="mono cell-muted">{e.employeeCode}</td>
                      <td className="cell-primary">{e.name}</td>
                      <td className="mono text-right">{formatCOP(e.totalEarnings)}</td>
                      <td className="mono text-right">{formatCOP(e.totalDeductions)}</td>
                      <td className="mono text-right">{formatCOP(e.netSalary)}</td>
                      <td className="text-right cell-muted">{e.noveltiesCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
