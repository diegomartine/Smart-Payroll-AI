import { useEffect, useState } from 'react';
import { Plus, Briefcase, Pencil, Ban } from 'lucide-react';
import { positionsApi } from '../../api/positions.api';
import type { Position } from '../../types/position.types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { PositionFormModal } from '../../components/positions/PositionFormModal';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

export function PositionsListPage() {
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [positions, setPositions] = useState<Position[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState<{ open: boolean; editing: Position | null }>({
    open: false,
    editing: null,
  });

  const load = () => {
    setLoading(true);
    positionsApi
      .list()
      .then(setPositions)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeactivate = async (position: Position) => {
    const ok = await confirm({
      title: 'Desactivar cargo',
      description: `"${position.name}" dejará de estar disponible para asignar a nuevos empleados. Los empleados que ya lo tienen no se ven afectados.`,
      confirmLabel: 'Desactivar',
      danger: true,
    });
    if (!ok) return;

    try {
      await positionsApi.deactivate(position.id);
      showToast('Cargo desactivado.', 'success');
      load();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  if (loading) return <Loading label="Cargando cargos…" />;

  return (
    <div className="stack">
      <PageHeader
        title="Cargos"
        description="Cargos disponibles para asignar a los empleados"
        actions={
          <button
            className="btn btn-accent"
            onClick={() => setModalState({ open: true, editing: null })}
          >
            <Plus size={16} /> Nuevo cargo
          </button>
        }
      />

      <div className="card">
        {!positions || positions.length === 0 ? (
          <EmptyState
            icon={<Briefcase size={20} />}
            title="No hay cargos registrados"
            description="Crea el primer cargo para poder asignarlo a los empleados."
            action={
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setModalState({ open: true, editing: null })}
              >
                <Plus size={14} /> Nuevo cargo
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
                {positions.map((p) => (
                  <tr key={p.id}>
                    <td className="cell-primary">{p.name}</td>
                    <td>
                      <span className={`badge ${p.isActive ? 'badge-green' : 'badge-slate'}`}>
                        {p.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          aria-label="Editar"
                          onClick={() => setModalState({ open: true, editing: p })}
                        >
                          <Pencil size={15} />
                        </button>
                        {p.isActive && (
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            aria-label="Desactivar"
                            onClick={() => handleDeactivate(p)}
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
        <PositionFormModal
          position={modalState.editing}
          onClose={() => setModalState({ open: false, editing: null })}
          onSaved={load}
        />
      )}
    </div>
  );
}
