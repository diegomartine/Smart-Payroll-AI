import { useEffect, useState } from 'react';
import { Plus, Building2, Pencil, Ban } from 'lucide-react';
import { departmentsApi } from '../../api/departments.api';
import type { Department } from '../../types/department.types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { DepartmentFormModal } from '../../components/departments/DepartmentFormModal';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

export function DepartmentsListPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [departments, setDepartments] = useState<Department[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{ open: boolean; editing: Department | null }>({
    open: false,
    editing: null,
  });

  const load = () => {
    setLoading(true);
    departmentsApi
      .list()
      .then(setDepartments)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeactivate = async (department: Department) => {
    const ok = await confirm({
      title: 'Desactivar departamento',
      description: `"${department.name}" dejará de estar disponible para asignar a nuevos empleados. Los empleados que ya lo tienen no se ven afectados.`,
      confirmLabel: 'Desactivar',
      danger: true,
    });
    if (!ok) return;

    try {
      await departmentsApi.deactivate(department.id);
      showToast('Departamento desactivado.', 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  if (loading) return <Loading label="Cargando departamentos…" />;

  return (
    <div className="stack">
      <PageHeader
        title="Departamentos"
        description="Departamentos / áreas disponibles para asignar a los empleados"
        actions={
          <button
            className="btn btn-accent"
            onClick={() => setModalState({ open: true, editing: null })}
          >
            <Plus size={16} /> Nuevo departamento
          </button>
        }
      />

      <div className="card">
        {!departments || departments.length === 0 ? (
          <EmptyState
            icon={<Building2 size={20} />}
            title="No hay departamentos registrados"
            description="Crea el primer departamento para poder asignarlo a los empleados."
            action={
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setModalState({ open: true, editing: null })}
              >
                <Plus size={14} /> Nuevo departamento
              </button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Estado</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {departments.map((d) => (
                  <tr key={d.id}>
                    <td className="cell-primary">{d.name}</td>
                    <td>
                      <span className={`badge ${d.isActive ? 'badge-green' : 'badge-slate'}`}>
                        {d.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          aria-label="Editar"
                          onClick={() => setModalState({ open: true, editing: d })}
                        >
                          <Pencil size={15} />
                        </button>
                        {d.isActive && (
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            aria-label="Desactivar"
                            onClick={() => handleDeactivate(d)}
                          >
                            <Ban size={15} color="#b3261e" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalState.open && (
        <DepartmentFormModal
          department={modalState.editing}
          onClose={() => setModalState({ open: false, editing: null })}
          onSaved={load}
        />
      )}
    </div>
  );
}
