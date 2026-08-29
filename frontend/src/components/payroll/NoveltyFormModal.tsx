import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import type { CreatePayrollNoveltyPayload, PayrollNovelty, PayrollNoveltyType } from '../../types/payroll.types';
import { noveltyTypeLabels } from '../../utils/labels';

interface NoveltyFormModalProps {
  initial?: PayrollNovelty;
  onClose: () => void;
  onSubmit: (payload: CreatePayrollNoveltyPayload) => Promise<void>;
}

interface FormState {
  type: PayrollNoveltyType;
  description: string;
  quantity: string;
  amount: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

export function NoveltyFormModal({ initial, onClose, onSubmit }: NoveltyFormModalProps) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<FormState>({
    type: initial?.type ?? 'BONUS',
    description: initial?.description ?? '',
    quantity: initial?.quantity ?? '',
    amount: initial?.amount ?? '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors: FieldErrors = {};
    const amountNum = Number(form.amount);
    if (!form.amount || Number.isNaN(amountNum) || amountNum <= 0) {
      fieldErrors.amount = 'Ingresa un monto válido, mayor a cero.';
    }
    if (form.quantity.trim() && Number.isNaN(Number(form.quantity))) {
      fieldErrors.quantity = 'La cantidad debe ser numérica.';
    }
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        type: form.type,
        description: form.description.trim() || undefined,
        quantity: form.quantity.trim() ? Number(form.quantity) : undefined,
        amount: amountNum,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar novedad' : 'Agregar novedad'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="stack" style={{ gap: 16 }}>
        <div className="field">
          <label htmlFor="novelty-type">Tipo de novedad</label>
          <select
            id="novelty-type"
            className="input"
            value={form.type}
            onChange={(e) => setField('type', e.target.value as PayrollNoveltyType)}
          >
            {(Object.keys(noveltyTypeLabels) as PayrollNoveltyType[]).map((t) => (
              <option key={t} value={t}>
                {noveltyTypeLabels[t]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="novelty-description">Descripción</label>
          <input
            id="novelty-description"
            className="input"
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="opcional"
          />
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="novelty-quantity">Cantidad</label>
            <input
              id="novelty-quantity"
              className={`input mono ${errors.quantity ? 'has-error' : ''}`}
              value={form.quantity}
              onChange={(e) => setField('quantity', e.target.value)}
              placeholder="opcional, ej. horas"
            />
            {errors.quantity && <span className="field-error">{errors.quantity}</span>}
          </div>
          <div className="field">
            <label htmlFor="novelty-amount">Monto (COP)</label>
            <input
              id="novelty-amount"
              type="number"
              min="0"
              step="1000"
              className={`input mono ${errors.amount ? 'has-error' : ''}`}
              value={form.amount}
              onChange={(e) => setField('amount', e.target.value)}
            />
            {errors.amount && <span className="field-error">{errors.amount}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar novedad'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
