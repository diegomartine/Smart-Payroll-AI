import { useState, type FormEvent } from 'react';
import { Modal } from '../ui/Modal';
import { departmentsApi } from '../../api/departments.api';
import type { Department } from '../../types/department.types';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';

interface DepartmentFormModalProps {
  department: Department | null;
  onClose: () => void;
  /** Se llama con el departamento recién creado/actualizado. */
  onSaved: (department: Department) => void;
}

export function DepartmentFormModal({ department, onClose, onSaved }: DepartmentFormModalProps) {
  const { showToast } = useToast();
  const isEdit = Boolean(department);
  const [name, setName] = useState(department?.name ?? '');
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
      let saved: Department;
      if (isEdit && department) {
        saved = await departmentsApi.update(department.id, { name: name.trim() });
        showToast('Departamento actualizado correctamente.', 'success');
      } else {
        saved = await departmentsApi.create({ name: name.trim() });
        showToast('Departamento creado correctamente.', 'success');
      }
      onSaved(saved);
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Editar departamento' : 'Nuevo departamento'} onClose={onClose}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <label htmlFor="department-name">Nombre del departamento</label>
          <input
            id="department-name"
            className={`input ${error ? 'has-error' : ''}`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="Recursos Humanos"
            autoFocus
          />
          {error && <span className="field-error">{error}</span>}
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear departamento'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
