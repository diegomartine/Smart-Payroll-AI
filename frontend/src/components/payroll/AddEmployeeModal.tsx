import { useEffect, useMemo, useState } from 'react';
import { Modal } from '../ui/Modal';
import { EmptyState } from '../ui/EmptyState';
import { employeesApi } from '../../api/employees.api';
import type { Employee } from '../../types/employee.types';
import { Users, Search } from 'lucide-react';

interface AddEmployeeModalProps {
  excludeEmployeeIds: number[];
  onClose: () => void;
  onAdd: (employeeId: number) => Promise<void>;
}

export function AddEmployeeModal({ excludeEmployeeIds, onClose, onAdd }: AddEmployeeModalProps) {
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [query, setQuery] = useState('');
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    employeesApi.list().then(setEmployees);
  }, []);

  const available = useMemo(() => {
    const excluded = new Set(excludeEmployeeIds);
    const list = (employees ?? []).filter((e) => !excluded.has(e.id));
    if (!query.trim()) return list;
    const q = query.trim().toLowerCase();
    return list.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q),
    );
  }, [employees, excludeEmployeeIds, query]);

  const handleAdd = async (id: number) => {
    setAddingId(id);
    try {
      await onAdd(id);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <Modal title="Agregar empleado a la nómina" onClose={onClose}>
      <div className="stack" style={{ gap: 14 }}>
        <div className="field">
          <div style={{ position: 'relative' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: 12, top: 11, color: 'var(--slate-400)' }}
            />
            <input
              className="input"
              style={{ paddingLeft: 34 }}
              placeholder="Buscar por nombre o código…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {employees === null ? (
          <p className="text-muted" style={{ fontSize: 13 }}>
            Cargando empleados…
          </p>
        ) : available.length === 0 ? (
          <EmptyState
            icon={<Users size={18} />}
            title="No hay empleados disponibles"
            description="Todos los empleados ya están asignados a esta nómina, o no hay coincidencias."
          />
        ) : (
          <div className="stack" style={{ gap: 6, maxHeight: 320, overflowY: 'auto' }}>
            {available.map((e) => (
              <div key={e.id} className="flex-between" style={{ padding: '8px 4px' }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600 }}>
                    {e.firstName} {e.lastName}
                  </p>
                  <p className="text-muted mono" style={{ fontSize: 11.5 }}>
                    {e.employeeCode} · {e.position}
                  </p>
                </div>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={addingId === e.id}
                  onClick={() => handleAdd(e.id)}
                >
                  {addingId === e.id ? 'Agregando…' : 'Agregar'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
