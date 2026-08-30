import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Users, Eye, Pencil, Trash2 } from 'lucide-react';
import { employeesApi } from '../../api/employees.api';
import type { Employee } from '../../types/employee.types';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageHeader } from '../../components/ui/PageHeader';
import { EmploymentStatusBadge } from '../../components/ui/StatusBadge';
import { formatCOP } from '../../utils/currency';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

export function EmployeesListPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    employeesApi
      .list()
      .then(setEmployees)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (emp: Employee) => {
    const ok = await confirm({
      title: 'Eliminar empleado',
      description: `¿Seguro que deseas eliminar a ${emp.firstName} ${emp.lastName}? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;

    try {
      await employeesApi.remove(emp.id);
      showToast('Empleado eliminado correctamente.', 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  if (loading) return <Loading label="Cargando empleados…" />;

  return (
    <div className="stack">
      <PageHeader
        title="Empleados"
        description="Gestiona la información de los empleados de la empresa"
        actions={
          <Link to="/employees/new" className="btn btn-accent">
            <Plus size={16} /> Nuevo empleado
          </Link>
        }
      />

      <div className="card">
        {!employees || employees.length === 0 ? (
          <EmptyState
            icon={<Users size={20} />}
            title="No hay empleados registrados"
            description="Registra tu primer empleado para empezar a asignarlo a nóminas."
            action={
              <Link to="/employees/new" className="btn btn-primary btn-sm">
                <Plus size={14} /> Nuevo empleado
              </Link>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nombre</th>
                  <th>Cargo</th>
                  <th>Departamento</th>
                  <th>Salario base</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="clickable"
                    onClick={() => navigate(`/employees/${emp.id}`)}
                  >
                    <td className="mono cell-muted">{emp.employeeCode}</td>
                    <td className="cell-primary">
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td className="cell-muted">{emp.position.name}</td>
                    <td className="cell-muted">{emp.department.name}</td>
                    <td className="mono">{formatCOP(emp.baseSalary)}</td>
                    <td>
                      <EmploymentStatusBadge status={emp.employmentStatus} />
                    </td>
                    <td>
                      <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                        <Link to={`/employees/${emp.id}`} className="btn btn-ghost btn-icon btn-sm" aria-label="Ver">
                          <Eye size={15} />
                        </Link>
                        <Link
                          to={`/employees/${emp.id}/edit`}
                          className="btn btn-ghost btn-icon btn-sm"
                          aria-label="Editar"
                        >
                          <Pencil size={15} />
                        </Link>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          aria-label="Eliminar"
                          onClick={() => handleDelete(emp)}
                        >
                          <Trash2 size={15} color="#b3261e" />
                        </button>
                      </div>
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
