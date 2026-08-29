import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import type { Payroll, UpdatePayrollPayload } from '../../types/payroll.types';
import { toDateInputValue } from '../../utils/date';

interface EditPayrollModalProps {
  payroll: Payroll;
  onClose: () => void;
  onSubmit: (payload: UpdatePayrollPayload) => Promise<void>;
}

interface FormState {
  period: string;
  startDate: string;
  endDate: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

export function EditPayrollModal({ payroll, onClose, onSubmit }: EditPayrollModalProps) {
  const [form, setForm] = useState<FormState>({
    period: payroll.period,
    startDate: toDateInputValue(payroll.startDate),
    endDate: toDateInputValue(payroll.endDate),
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors: FieldErrors = {};
    if (!form.period.trim()) fieldErrors.period = 'El periodo es obligatorio.';
    if (!form.startDate) fieldErrors.startDate = 'La fecha inicial es obligatoria.';
    if (!form.endDate) fieldErrors.endDate = 'La fecha final es obligatoria.';
    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      fieldErrors.endDate = 'La fecha final debe ser posterior a la fecha inicial.';
    }
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSaving(true);
    try {
      await onSubmit({
        period: form.period.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Editar nómina" onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate className="stack" style={{ gap: 16 }}>
        <div className="field">
          <label htmlFor="edit-period">Periodo</label>
          <input
            id="edit-period"
            className={`input ${errors.period ? 'has-error' : ''}`}
            value={form.period}
            onChange={(e) => setField('period', e.target.value)}
          />
          {errors.period && <span className="field-error">{errors.period}</span>}
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="edit-startDate">Fecha inicial</label>
            <input
              id="edit-startDate"
              type="date"
              className={`input ${errors.startDate ? 'has-error' : ''}`}
              value={form.startDate}
              onChange={(e) => setField('startDate', e.target.value)}
            />
            {errors.startDate && <span className="field-error">{errors.startDate}</span>}
          </div>
          <div className="field">
            <label htmlFor="edit-endDate">Fecha final</label>
            <input
              id="edit-endDate"
              type="date"
              className={`input ${errors.endDate ? 'has-error' : ''}`}
              value={form.endDate}
              onChange={(e) => setField('endDate', e.target.value)}
            />
            {errors.endDate && <span className="field-error">{errors.endDate}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
