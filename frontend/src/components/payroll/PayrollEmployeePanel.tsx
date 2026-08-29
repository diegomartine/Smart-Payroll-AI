import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ReceiptText } from 'lucide-react';
import { noveltiesApi } from '../../api/novelties.api';
import { payrollApi } from '../../api/payroll.api';
import type {
  CreatePayrollNoveltyPayload,
  PayrollEmployee,
  PayrollEmployeeCalculation,
  PayrollNovelty,
} from '../../types/payroll.types';
import { NoveltyFormModal } from './NoveltyFormModal';
import { PayrollCalculationReceipt } from './PayrollCalculationReceipt';
import { EmptyState } from '../ui/EmptyState';
import { Loading } from '../ui/Loading';
import { noveltyTypeLabels, isEarningNovelty } from '../../utils/labels';
import { formatCOP } from '../../utils/currency';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

interface PayrollEmployeePanelProps {
  payrollId: number;
  payrollEmployee: PayrollEmployee;
  canEdit: boolean;
}

export function PayrollEmployeePanel({ payrollId, payrollEmployee, canEdit }: PayrollEmployeePanelProps) {
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [novelties, setNovelties] = useState<PayrollNovelty[] | null>(null);
  const [calculation, setCalculation] = useState<PayrollEmployeeCalculation | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNovelty, setEditingNovelty] = useState<PayrollNovelty | undefined>(undefined);

  const employeeId = payrollEmployee.employeeId;

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      noveltiesApi.listByPayrollEmployee(payrollId, employeeId),
      payrollApi.calculateEmployee(payrollEmployee.id),
    ])
      .then(([nov, calc]) => {
        setNovelties(nov);
        setCalculation(calc);
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, [payrollEmployee.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = async (payload: CreatePayrollNoveltyPayload) => {
    try {
      await noveltiesApi.create(payrollId, employeeId, payload);
      showToast('Novedad agregada correctamente.', 'success');
      setModalOpen(false);
      loadAll();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleUpdate = async (payload: CreatePayrollNoveltyPayload) => {
    if (!editingNovelty) return;
    try {
      await noveltiesApi.update(editingNovelty.id, payload);
      showToast('Novedad actualizada correctamente.', 'success');
      setEditingNovelty(undefined);
      loadAll();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDelete = async (novelty: PayrollNovelty) => {
    const ok = await confirm({
      title: 'Eliminar novedad',
      description: `¿Deseas eliminar la novedad "${noveltyTypeLabels[novelty.type]}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;

    try {
      await noveltiesApi.remove(novelty.id);
      showToast('Novedad eliminada correctamente.', 'success');
      loadAll();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-header">
          <span className="card-title">Novedades</span>
          {canEdit && (
            <button className="btn btn-secondary btn-sm" onClick={() => setModalOpen(true)}>
              <Plus size={14} /> Agregar novedad
            </button>
          )}
        </div>

        {loading ? (
          <Loading label="Cargando novedades…" />
        ) : !novelties || novelties.length === 0 ? (
          <EmptyState
            icon={<ReceiptText size={18} />}
            title="Sin novedades registradas"
            description="Agrega horas extra, bonificaciones, deducciones u otras novedades para este empleado."
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descripción</th>
                  <th>Cantidad</th>
                  <th>Monto</th>
                  {canEdit && <th />}
                </tr>
              </thead>
              <tbody>
                {novelties.map((n) => (
                  <tr key={n.id}>
                    <td>
                      <span className={`badge ${isEarningNovelty(n.type) ? 'badge-green' : 'badge-red'}`}>
                        {noveltyTypeLabels[n.type]}
                      </span>
                    </td>
                    <td className="cell-muted">{n.description ?? '—'}</td>
                    <td className="mono cell-muted">{n.quantity ?? '—'}</td>
                    <td className="mono">{formatCOP(n.amount)}</td>
                    {canEdit && (
                      <td>
                        <div className="row-actions">
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            aria-label="Editar novedad"
                            onClick={() => setEditingNovelty(n)}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            className="btn btn-ghost btn-icon btn-sm"
                            aria-label="Eliminar novedad"
                            onClick={() => handleDelete(n)}
                          >
                            <Trash2 size={14} color="#b3261e" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>{loading ? <Loading label="Calculando…" /> : calculation && <PayrollCalculationReceipt calculation={calculation} />}</div>

      {modalOpen && (
        <NoveltyFormModal onClose={() => setModalOpen(false)} onSubmit={handleCreate} />
      )}
      {editingNovelty && (
        <NoveltyFormModal
          initial={editingNovelty}
          onClose={() => setEditingNovelty(undefined)}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
