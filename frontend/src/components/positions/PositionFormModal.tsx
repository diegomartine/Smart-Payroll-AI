import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { positionsApi } from '../../api/positions.api';
import type { Position } from '../../types/position.types';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';

interface PositionFormModalProps {
  position: Position | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PositionFormModal({ position, onClose, onSaved }: PositionFormModalProps) {
  const { showToast } = useToast();
  const isEdit = Boolean(position);
  const [name, setName] = useState(position?.name ?? '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    setSaving(true);
    try {
      if (isEdit && position) {
        await positionsApi.update(position.id, { name: name.trim() });
        showToast('Cargo actualizado correctamente.', 'success');
      } else {
        await positionsApi.create({ name: name.trim() });
        showToast('Cargo creado correctamente.', 'success');
      }
      onSaved();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar cargo' : 'Nuevo cargo'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="position-name">Nombre del cargo</label>
          <input
            id="position-name"
            className={`input ${error ? 'has-error' : ''}`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Analista de nómina"
            autoFocus
          />
          {error && <span className="field-error">{error}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cargo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
