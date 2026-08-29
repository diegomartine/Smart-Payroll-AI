import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Wallet } from 'lucide-react';
import { payrollApi } from '../../api/payroll.api';
import type { Payroll } from '../../types/payroll.types';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { PayrollStatusBadge } from '../../components/ui/StatusBadge';
import { formatDate } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';

export function PayrollListPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [payrolls, setPayrolls] = useState<Payroll[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    payrollApi
      .list()
      .then(setPayrolls)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <Loading label="Cargando nóminas…" />;

  return (
    <div className="stack">
      <PageHeader
        title="Nóminas"
        description="Crea y administra los periodos de nómina"
        actions={
          <Link to="/payroll/new" className="btn btn-accent">
            <Plus size={16} /> Nueva nómina
          </Link>
        }
      />

      <div className="card">
        {!payrolls || payrolls.length === 0 ? (
          <EmptyState
            icon={<Wallet size={20} />}
            title="No hay nóminas registradas"
            description="Crea una nómina para asignar empleados y calcular sus pagos."
            action={
              <Link to="/payroll/new" className="btn btn-primary btn-sm">
                <Plus size={14} /> Nueva nómina
              </Link>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Periodo</th>
                  <th>Fecha inicial</th>
                  <th>Fecha final</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((p) => (
                  <tr key={p.id} className="clickable" onClick={() => navigate(`/payroll/${p.id}`)}>
                    <td className="cell-primary">{p.period}</td>
                    <td className="cell-muted">{formatDate(p.startDate)}</td>
                    <td className="cell-muted">{formatDate(p.endDate)}</td>
                    <td>
                      <PayrollStatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
