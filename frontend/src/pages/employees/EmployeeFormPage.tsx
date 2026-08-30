import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { employeesApi } from '../../api/employees.api';
import { positionsApi } from '../../api/positions.api';
import { departmentsApi } from '../../api/departments.api';
import { PageHeader } from '../../components/ui/PageHeader';
import { Loading } from '../../components/ui/Loading';
import type {
  CreateEmployeePayload,
  DocumentType,
  Employee,
  EmploymentStatus,
} from '../../types/employee.types';
import type { Position } from '../../types/position.types';
import type { Department } from '../../types/department.types';
import { documentTypeLabels, employmentStatusLabels } from '../../utils/labels';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';

type FormState = {
  employeeCode: string;
  documentType: DocumentType;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  positionId: string;
  departmentId: string;
  baseSalary: string;
  hireDate: string;
  employmentStatus: EmploymentStatus;
};

const emptyForm: FormState = {
  employeeCode: '',
  documentType: 'CC',
  documentNumber: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  positionId: '',
  departmentId: '',
  baseSalary: '',
  hireDate: '',
  employmentStatus: 'ACTIVE',
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

function toFormState(emp: Employee): FormState {
  return {
    employeeCode: emp.employeeCode,
    documentType: emp.documentType,
    documentNumber: emp.documentNumber,
    firstName: emp.firstName,
    lastName: emp.lastName,
    email: emp.email ?? '',
    phone: emp.phone ?? '',
    positionId: String(emp.positionId),
    departmentId: String(emp.departmentId),
    baseSalary: emp.baseSalary,
    hireDate: emp.hireDate.slice(0, 10),
    employmentStatus: emp.employmentStatus,
  };
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.employeeCode.trim()) errors.employeeCode = 'El código es obligatorio.';
  if (!form.documentNumber.trim()) errors.documentNumber = 'El número de documento es obligatorio.';
  if (!form.firstName.trim()) errors.firstName = 'El nombre es obligatorio.';
  if (!form.lastName.trim()) errors.lastName = 'El apellido es obligatorio.';
  if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) {
    errors.email = 'Correo electrónico no válido.';
  }
  if (!form.positionId) errors.positionId = 'Selecciona un cargo.';
  if (!form.departmentId) errors.departmentId = 'Selecciona un departamento.';
  const salaryNum = Number(form.baseSalary);
  if (!form.baseSalary || Number.isNaN(salaryNum) || salaryNum <= 0) {
    errors.baseSalary = 'Ingresa un salario base válido, mayor a cero.';
  }
  if (!form.hireDate) errors.hireDate = 'La fecha de ingreso es obligatoria.';
  return errors;
}

export function EmployeeFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [positions, setPositions] = useState<Position[] | null>(null);
  const [departments, setDepartments] = useState<Department[] | null>(null);

  // Cargos y departamentos activos para los selectores del formulario.
  useEffect(() => {
    Promise.all([positionsApi.listActive(), departmentsApi.listActive()])
      .then(([pos, dep]) => {
        setPositions(pos);
        setDepartments(dep);
      })
      .catch((err) => showToast(getErrorMessage(err), 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    employeesApi
      .getById(Number(id))
      .then((emp) => setForm(toFormState(emp)))
      .catch((err) => {
        showToast(getErrorMessage(err), 'error');
        navigate('/employees');
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    const payload: CreateEmployeePayload = {
      employeeCode: form.employeeCode.trim(),
      documentType: form.documentType,
      documentNumber: form.documentNumber.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      positionId: Number(form.positionId),
      departmentId: Number(form.departmentId),
      baseSalary: Number(form.baseSalary),
      hireDate: `${form.hireDate}T00:00:00.000Z`,
      employmentStatus: form.employmentStatus,
    };

    setSaving(true);
    try {
      if (isEdit && id) {
        await employeesApi.update(Number(id), payload);
        showToast('Empleado actualizado correctamente.', 'success');
        navigate(`/employees/${id}`);
      } else {
        const created = await employeesApi.create(payload);
        showToast('Empleado creado correctamente.', 'success');
        navigate(`/employees/${created.id}`);
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading label="Cargando empleado…" />;

  return (
    <div className="stack">
      <PageHeader
        title={isEdit ? 'Editar empleado' : 'Nuevo empleado'}
        backTo={isEdit ? `/employees/${id}` : '/employees'}
        backLabel={isEdit ? 'Volver al detalle' : 'Volver a empleados'}
      />

      <form className="card card-pad" onSubmit={handleSubmit} noValidate>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="employeeCode">Código de empleado</label>
            <input
              id="employeeCode"
              className={`input mono ${errors.employeeCode ? 'has-error' : ''}`}
              value={form.employeeCode}
              onChange={(e) => setField('employeeCode', e.target.value)}
              placeholder="EMP-001"
            />
            {errors.employeeCode && <span className="field-error">{errors.employeeCode}</span>}
          </div>

          <div className="field">
            <label htmlFor="employmentStatus">Estado</label>
            <select
              id="employmentStatus"
              className="input"
              value={form.employmentStatus}
              onChange={(e) => setField('employmentStatus', e.target.value as EmploymentStatus)}
            >
              {(Object.keys(employmentStatusLabels) as EmploymentStatus[]).map((s) => (
                <option key={s} value={s}>
                  {employmentStatusLabels[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="firstName">Nombres</label>
            <input
              id="firstName"
              className={`input ${errors.firstName ? 'has-error' : ''}`}
              value={form.firstName}
              onChange={(e) => setField('firstName', e.target.value)}
            />
            {errors.firstName && <span className="field-error">{errors.firstName}</span>}
          </div>

          <div className="field">
            <label htmlFor="lastName">Apellidos</label>
            <input
              id="lastName"
              className={`input ${errors.lastName ? 'has-error' : ''}`}
              value={form.lastName}
              onChange={(e) => setField('lastName', e.target.value)}
            />
            {errors.lastName && <span className="field-error">{errors.lastName}</span>}
          </div>

          <div className="field">
            <label htmlFor="documentType">Tipo de documento</label>
            <select
              id="documentType"
              className="input"
              value={form.documentType}
              onChange={(e) => setField('documentType', e.target.value as DocumentType)}
            >
              {(Object.keys(documentTypeLabels) as DocumentType[]).map((d) => (
                <option key={d} value={d}>
                  {documentTypeLabels[d]}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label htmlFor="documentNumber">Número de documento</label>
            <input
              id="documentNumber"
              className={`input mono ${errors.documentNumber ? 'has-error' : ''}`}
              value={form.documentNumber}
              onChange={(e) => setField('documentNumber', e.target.value)}
            />
            {errors.documentNumber && <span className="field-error">{errors.documentNumber}</span>}
          </div>

          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className={`input ${errors.email ? 'has-error' : ''}`}
              value={form.email}
              onChange={(e) => setField('email', e.target.value)}
              placeholder="opcional"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="phone">Teléfono</label>
            <input
              id="phone"
              className="input"
              value={form.phone}
              onChange={(e) => setField('phone', e.target.value)}
              placeholder="opcional"
            />
          </div>

          <div className="field">
            <label htmlFor="positionId">Cargo</label>
            <select
              id="positionId"
              className={`input ${errors.positionId ? 'has-error' : ''}`}
              value={form.positionId}
              onChange={(e) => setField('positionId', e.target.value)}
              disabled={!positions}
            >
              <option value="">{positions ? 'Selecciona un cargo…' : 'Cargando cargos…'}</option>
              {positions?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.positionId && <span className="field-error">{errors.positionId}</span>}
            {positions && positions.length === 0 && (
              <span className="field-hint">
                No hay cargos activos todavía. Créalos en la sección "Cargos".
              </span>
            )}
          </div>

          <div className="field">
            <label htmlFor="departmentId">Departamento</label>
            <select
              id="departmentId"
              className={`input ${errors.departmentId ? 'has-error' : ''}`}
              value={form.departmentId}
              onChange={(e) => setField('departmentId', e.target.value)}
              disabled={!departments}
            >
              <option value="">{departments ? 'Selecciona un departamento…' : 'Cargando departamentos…'}</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {errors.departmentId && <span className="field-error">{errors.departmentId}</span>}
          </div>

          <div className="field">
            <label htmlFor="baseSalary">Salario base (COP)</label>
            <input
              id="baseSalary"
              type="number"
              min="0"
              step="1000"
              className={`input mono ${errors.baseSalary ? 'has-error' : ''}`}
              value={form.baseSalary}
              onChange={(e) => setField('baseSalary', e.target.value)}
              placeholder="3500000"
            />
            {errors.baseSalary && <span className="field-error">{errors.baseSalary}</span>}
          </div>

          <div className="field">
            <label htmlFor="hireDate">Fecha de ingreso</label>
            <input
              id="hireDate"
              type="date"
              className={`input ${errors.hireDate ? 'has-error' : ''}`}
              value={form.hireDate}
              onChange={(e) => setField('hireDate', e.target.value)}
            />
            {errors.hireDate && <span className="field-error">{errors.hireDate}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(isEdit ? `/employees/${id}` : '/employees')}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear empleado'}
          </button>
        </div>
      </form>
    </div>
  );
}
