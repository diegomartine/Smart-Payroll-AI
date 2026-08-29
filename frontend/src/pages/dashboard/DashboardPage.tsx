import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Wallet, FileClock, Loader, CheckCircle2, Plus, ArrowRight } from 'lucide-react';
import { employeesApi } from '../../api/employees.api';
import { payrollApi } from '../../api/payroll.api';
import { StatCard } from '../../components/ui/StatCard';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { PayrollStatusBadge } from '../../components/ui/StatusBadge';
import { PageHeader } from '../../components/ui/PageHeader';
import type { Employee } from '../../types/employee.types';
import type { Payroll } from '../../types/payroll.types';
import { formatDate } from '../../utils/date';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';

export function DashboardPage() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [payrolls, setPayrolls] = useState<Payroll[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([employeesApi.list(), payrollApi.list()])
      .then(([emp, pay]) => {
        if (!active) return;
        setEmployees(emp);
        setPayrolls(pay);
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const p = payrolls ?? [];
    return {
      totalEmployees: employees?.length ?? 0,
      totalPayrolls: p.length,
      draft: p.filter((x) => x.status === 'DRAFT').length,
      processing: p.filter((x) => x.status === 'PROCESSING').length,
      completed: p.filter((x) => x.status === 'COMPLETED').length,
    };
  }, [employees, payrolls]);

  const recentPayrolls = useMemo(
    () => [...(payrolls ?? [])].slice(0, 5),
    [payrolls],
  );

  if (loading) return <Loading label="Cargando panel…" />;

  return (
    <div className="stack">
      <PageHeader
        title="Dashboard"
        description="Resumen general de empleados y nóminas"
        actions={
          <>
            <Link to="/employees/new" className="btn btn-secondary">
              <Plus size={16} /> Empleado
            </Link>
            <Link to="/payroll/new" className="btn btn-accent">
              <Plus size={16} /> Nueva nómina
            </Link>
          </>
        }
      />

      <div className="stats-grid">
        <StatCard icon={<Users size={18} />} label="Total de empleados" value={stats.totalEmployees} />
        <StatCard icon={<Wallet size={18} />} label="Total de nóminas" value={stats.totalPayrolls} />
        <StatCard icon={<FileClock size={18} />} label="Nóminas en borrador" value={stats.draft} />
        <StatCard icon={<Loader size={18} />} label="En proceso" value={stats.processing} />
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Últimas nóminas</span>
            <Link to="/payroll" className="btn btn-ghost btn-sm">
              Ver todas <ArrowRight size={14} />
            </Link>
          </div>
          {recentPayrolls.length === 0 ? (
            <EmptyState
              icon={<Wallet size={20} />}
              title="Aún no hay nóminas"
              description="Crea tu primera nómina para empezar a procesar pagos."
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
                    <th>Rango</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentPayrolls.map((p) => (
                    <tr key={p.id} className="clickable" onClick={() => (window.location.href = `/payroll/${p.id}`)}>
                      <td className="cell-primary">{p.period}</td>
                      <td className="cell-muted">
                        {formatDate(p.startDate)} – {formatDate(p.endDate)}
                      </td>
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

        <div className="card card-pad stack" style={{ gap: 14 }}>
          <span className="card-title">Acciones rápidas</span>
          <Link to="/employees/new" className="btn btn-secondary w-full">
            <Users size={16} /> Registrar empleado
          </Link>
          <Link to="/payroll/new" className="btn btn-secondary w-full">
            <Wallet size={16} /> Crear nómina
          </Link>
          <Link to="/employees" className="btn btn-ghost w-full">
            Ver empleados <ArrowRight size={14} />
          </Link>
          <hr className="divider" style={{ margin: '4px 0' }} />
          <div className="flex gap-8" style={{ alignItems: 'center', color: 'var(--green-700)' }}>
            <CheckCircle2 size={16} />
            <span style={{ fontSize: 13 }}>{stats.completed} nóminas completadas</span>
          </div>
        </div>
      </div>
    </div>
  );
}
