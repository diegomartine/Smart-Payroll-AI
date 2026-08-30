import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Wallet,
  FileClock,
  Loader,
  CheckCircle2,
  Plus,
  ArrowRight,
  Trophy,
  FileSpreadsheet,
  Sparkles,
  Download,
} from 'lucide-react';
import { employeesApi } from '../../api/employees.api';
import { payrollApi } from '../../api/payroll.api';
import { analysisApi } from '../../api/analysis.api';
import { pdfApi } from '../../api/pdf.api';
import { StatCard } from '../../components/ui/StatCard';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { PayrollStatusBadge } from '../../components/ui/StatusBadge';
import { PageHeader } from '../../components/ui/PageHeader';
import type { Employee } from '../../types/employee.types';
import type { Payroll } from '../../types/payroll.types';
import { isFullAnalysis, type PayrollAnalysis } from '../../types/analysis.types';
import { formatDate } from '../../utils/date';
import { formatCOP } from '../../utils/currency';
import { getErrorMessage, getBlobErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';

export function DashboardPage() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [payrolls, setPayrolls] = useState<Payroll[] | null>(null);
  const [loading, setLoading] = useState(true);

  // Análisis de la nómina más reciente (GET /payroll ya ordena por
  // createdAt desc), para mostrar "Nómina actual" / "Mayor pago" / "Neto
  // mayor pago" con datos reales. Si no hay nóminas, o la más reciente no
  // tiene empleados, esta sección simplemente no se muestra.
  const [latestAnalysis, setLatestAnalysis] = useState<PayrollAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

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

  const latestPayroll = payrolls?.[0] ?? null;

  useEffect(() => {
    if (!latestPayroll) return;
    let active = true;
    setAnalysisLoading(true);
    analysisApi
      .analyzePayroll(latestPayroll.id)
      .then((a) => active && setLatestAnalysis(a))
      .catch(() => {
        /* si falla, la sección de "nómina actual" simplemente no se muestra */
      })
      .finally(() => active && setAnalysisLoading(false));
    return () => {
      active = false;
    };
  }, [latestPayroll]);

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

  const recentPayrolls = useMemo(() => [...(payrolls ?? [])].slice(0, 5), [payrolls]);

  const handleDownloadLatestPdf = async () => {
    if (!latestPayroll) return;
    setDownloadingPdf(true);
    try {
      await pdfApi.downloadPayroll(latestPayroll.id);
    } catch (err) {
      showToast(await getBlobErrorMessage(err), 'error');
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (loading) return <Loading label="Cargando panel…" />;

  const showLatestAnalysis = !analysisLoading && latestAnalysis && isFullAnalysis(latestAnalysis);

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

      {analysisLoading && <Loading label="Calculando nómina más reciente…" />}

      {showLatestAnalysis && latestAnalysis && isFullAnalysis(latestAnalysis) && (
        <div className="stack" style={{ gap: 10 }}>
          <span className="section-title" style={{ marginBottom: 0 }}>
            Nómina más reciente · {latestAnalysis.period}
          </span>
          <div className="stats-grid">
            <StatCard icon={<Wallet size={18} />} label="Nómina actual" value={formatCOP(latestAnalysis.totalPayroll)} />
            <StatCard icon={<Trophy size={18} />} label="Mayor pago" value={latestAnalysis.highestPaidEmployee.name} />
            <StatCard
              icon={<Wallet size={18} />}
              label="Neto mayor pago"
              value={formatCOP(latestAnalysis.highestPaidEmployee.netSalary)}
            />
            <StatCard icon={<Users size={18} />} label="Empleados en la nómina" value={latestAnalysis.employeesCount} />
          </div>
        </div>
      )}

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
              description="Crea tu primera nómina o importa un Excel para empezar a procesar pagos."
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
          <Link to="/imports" className="btn btn-secondary w-full">
            <FileSpreadsheet size={16} /> Importar Excel
          </Link>
          <Link to="/payroll/new" className="btn btn-secondary w-full">
            <Wallet size={16} /> Nueva nómina
          </Link>
          <Link to="/employees" className="btn btn-secondary w-full">
            <Users size={16} /> Ver empleados
          </Link>
          <Link to="/analysis" className="btn btn-secondary w-full">
            <Sparkles size={16} /> Ver análisis
          </Link>
          <button
            className="btn btn-secondary w-full"
            disabled={!latestPayroll || downloadingPdf}
            onClick={handleDownloadLatestPdf}
          >
            <Download size={16} />
            {downloadingPdf
              ? 'Generando…'
              : latestPayroll
                ? `Descargar nómina PDF (${latestPayroll.period})`
                : 'Descargar nómina PDF'}
          </button>
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
