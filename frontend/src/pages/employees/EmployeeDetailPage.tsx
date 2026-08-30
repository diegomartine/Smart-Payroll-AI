import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, Mail, Phone, Calendar, Building2, Briefcase } from 'lucide-react';
import { employeesApi } from '../../api/employees.api';
import type { Employee } from '../../types/employee.types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Loading } from '../../components/ui/Loading';
import { EmploymentStatusBadge } from '../../components/ui/StatusBadge';
import { formatCOP } from '../../utils/currency';
import { formatDate } from '../../utils/date';
import { documentTypeLabels } from '../../utils/labels';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

export function EmployeeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    employeesApi
      .getById(Number(id))
      .then(setEmployee)
      .catch((err) => {
        showToast(getErrorMessage(err), 'error');
        navigate('/employees');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDelete = async () => {
    if (!employee) return;
    const ok = await confirm({
      title: 'Eliminar empleado',
      description: `¿Seguro que deseas eliminar a ${employee.firstName} ${employee.lastName}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;

    try {
      await employeesApi.remove(employee.id);
      showToast('Empleado eliminado correctamente.', 'success');
      navigate('/employees');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  if (loading) return <Loading label="Cargando empleado…" />;
  if (!employee) return null;

  return (
    <div className="stack">
      <PageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        description={`Código ${employee.employeeCode}`}
        backTo="/employees"
        backLabel="Volver a empleados"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => navigate(`/employees/${employee.id}/edit`)}>
              <Pencil size={15} /> Editar
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              <Trash2 size={15} /> Eliminar
            </button>
          </>
        }
      />

      <div className="grid-2">
        <div className="card card-pad stack" style={{ gap: 18 }}>
          <div className="flex-between">
            <span className="section-title" style={{ marginBottom: 0 }}>
              Información general
            </span>
            <EmploymentStatusBadge status={employee.employmentStatus} />
          </div>

          <div className="form-grid">
            <InfoField icon={<Briefcase size={14} />} label="Cargo" value={employee.position.name} />
            <InfoField icon={<Building2 size={14} />} label="Departamento" value={employee.department.name} />
            <InfoField
              icon={<Calendar size={14} />}
              label="Fecha de ingreso"
              value={formatDate(employee.hireDate)}
            />
            <InfoField label="Tipo de documento" value={documentTypeLabels[employee.documentType]} />
            <InfoField label="Número de documento" value={employee.documentNumber} mono />
            <InfoField icon={<Mail size={14} />} label="Correo" value={employee.email ?? '—'} />
            <InfoField icon={<Phone size={14} />} label="Teléfono" value={employee.phone ?? '—'} />
          </div>
        </div>

        <div className="card card-pad stack" style={{ gap: 10 }}>
          <span className="section-title" style={{ marginBottom: 0 }}>
            Salario base
          </span>
          <div className="stat-value" style={{ fontSize: 26 }}>
            {formatCOP(employee.baseSalary)}
          </div>
          <p className="text-muted" style={{ fontSize: 12.5 }}>
            Mensual, antes de novedades por nómina.
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoField({
  icon,
  label,
  value,
  mono,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="field">
      <label className="flex gap-8" style={{ alignItems: 'center' }}>
        {icon}
        {label}
      </label>
      <p className={mono ? 'mono' : ''} style={{ fontSize: 13.5 }}>
        {value}
      </p>
    </div>
  );
}
