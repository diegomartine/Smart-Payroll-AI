import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, UserPlus, Users2, X } from 'lucide-react';
import { payrollApi } from '../../api/payroll.api';
import type { Payroll, PayrollEmployee, PayrollStatus, UpdatePayrollPayload } from '../../types/payroll.types';
import { PageHeader } from '../../components/ui/PageHeader';
import { Loading } from '../../components/ui/Loading';
import { EmptyState } from '../../components/ui/EmptyState';
import { PayrollStatusBadge } from '../../components/ui/StatusBadge';
import { AddEmployeeModal } from '../../components/payroll/AddEmployeeModal';
import { EditPayrollModal } from '../../components/payroll/EditPayrollModal';
import { PayrollEmployeePanel } from '../../components/payroll/PayrollEmployeePanel';
import { PayrollSummaryCard } from '../../components/payroll/PayrollSummaryCard';
import { formatDate } from '../../utils/date';
import { payrollStatusLabels, validPayrollStatusTransitions } from '../../utils/labels';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';
import { useConfirm } from '../../hooks/useConfirm';

export function PayrollDetailPage() {
  const { id } = useParams();
  const payrollId = Number(id);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const confirm = useConfirm();

  const [payroll, setPayroll] = useState<Payroll | null>(null);
  const [payrollEmployees, setPayrollEmployees] = useState<PayrollEmployee[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([payrollApi.getById(payrollId), payrollApi.listEmployees(payrollId)])
      .then(([p, employees]) => {
        setPayroll(p);
        setPayrollEmployees(employees);
        setSelectedEmployeeId((current) =>
          current && employees.some((e) => e.id === current) ? current : (employees[0]?.id ?? null),
        );
      })
      .catch((err) => {
        showToast(getErrorMessage(err), 'error');
        navigate('/payroll');
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, [payrollId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loading label="Cargando nómina…" />;
  if (!payroll || !payrollEmployees) return null;

  // El backend solo bloquea agregar empleados / agregar-editar-eliminar
  // novedades cuando la nómina no está en DRAFT (validatePayrollEditable en
  // payroll.service.ts). Quitar un empleado, y editar/eliminar la nómina en
  // sí, no tienen esa validación en el backend, así que aquí no se
  // deshabilitan (ver README, "Endpoints no disponibles / comportamiento").
  const canModifyContent = payroll.status === 'DRAFT';
  const nextStatuses = validPayrollStatusTransitions[payroll.status];
  const selectedEmployee = payrollEmployees.find((pe) => pe.id === selectedEmployeeId) ?? null;

  const handleAddEmployee = async (employeeId: number) => {
    try {
      await payrollApi.addEmployee(payrollId, employeeId);
      showToast('Empleado agregado a la nómina.', 'success');
      setAddModalOpen(false);
      loadAll();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleRemoveEmployee = async (pe: PayrollEmployee) => {
    const ok = await confirm({
      title: 'Quitar empleado de la nómina',
      description: `¿Deseas quitar a ${pe.employee.firstName} ${pe.employee.lastName} de esta nómina? Sus novedades registradas también se perderán.`,
      confirmLabel: 'Quitar',
      danger: true,
    });
    if (!ok) return;

    try {
      await payrollApi.removeEmployee(payrollId, pe.employeeId);
      showToast('Empleado quitado de la nómina.', 'success');
      loadAll();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleEditPayroll = async (payload: UpdatePayrollPayload) => {
    try {
      const updated = await payrollApi.update(payrollId, payload);
      setPayroll(updated);
      showToast('Nómina actualizada correctamente.', 'success');
      setEditModalOpen(false);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleDeletePayroll = async () => {
    const ok = await confirm({
      title: 'Eliminar nómina',
      description: `¿Seguro que deseas eliminar la nómina "${payroll.period}"? Esta acción no se puede deshacer.`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;

    try {
      await payrollApi.remove(payrollId);
      showToast('Nómina eliminada correctamente.', 'success');
      navigate('/payroll');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const handleStatusChange = async (status: PayrollStatus) => {
    setChangingStatus(true);
    try {
      const updated = await payrollApi.updateStatus(payrollId, status);
      setPayroll(updated);
      showToast(`Estado actualizado a "${payrollStatusLabels[status]}".`, 'success');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setChangingStatus(false);
    }
  };

  return (
    <div className="stack">
      <PageHeader
        title={payroll.period}
        description={`${formatDate(payroll.startDate)} – ${formatDate(payroll.endDate)}`}
        backTo="/payroll"
        backLabel="Volver a nóminas"
        actions={
          <>
            <button className="btn btn-secondary" onClick={() => setEditModalOpen(true)}>
              <Pencil size={15} /> Editar
            </button>
            <button className="btn btn-danger" onClick={handleDeletePayroll}>
              <Trash2 size={15} /> Eliminar
            </button>
          </>
        }
      />

      <div className="card card-pad">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div className="flex gap-12" style={{ alignItems: 'center' }}>
            <span className="text-muted" style={{ fontSize: 13 }}>
              Estado actual
            </span>
            <PayrollStatusBadge status={payroll.status} />
          </div>

          {nextStatuses.length > 0 ? (
            <div className="flex gap-8" style={{ flexWrap: 'wrap' }}>
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  className={s === 'CANCELLED' ? 'btn btn-danger btn-sm' : 'btn btn-accent btn-sm'}
                  disabled={changingStatus}
                  onClick={() => handleStatusChange(s)}
                >
                  {s === 'CANCELLED' ? 'Cancelar nómina' : `Pasar a "${payrollStatusLabels[s]}"`}
                </button>
              ))}
            </div>
          ) : (
            <span className="text-muted" style={{ fontSize: 12.5 }}>
              Este estado es final; no admite más transiciones.
            </span>
          )}
        </div>
      </div>

      <PayrollSummaryCard payrollEmployees={payrollEmployees} />

      <div className="card">
        <div className="card-header">
          <span className="card-title">Empleados asociados</span>
          {canModifyContent && (
            <button className="btn btn-secondary btn-sm" onClick={() => setAddModalOpen(true)}>
              <UserPlus size={14} /> Agregar empleado
            </button>
          )}
        </div>

        {payrollEmployees.length === 0 ? (
          <EmptyState
            icon={<Users2 size={20} />}
            title="Sin empleados en esta nómina"
            description={
              canModifyContent
                ? 'Agrega empleados para registrar sus novedades y calcular su pago.'
                : 'Esta nómina no tiene empleados asignados.'
            }
            action={
              canModifyContent && (
                <button className="btn btn-primary btn-sm" onClick={() => setAddModalOpen(true)}>
                  <UserPlus size={14} /> Agregar empleado
                </button>
              )
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
                  <th />
                </tr>
              </thead>
              <tbody>
                {payrollEmployees.map((pe) => (
                  <tr
                    key={pe.id}
                    className="clickable"
                    style={
                      pe.id === selectedEmployeeId
                        ? { background: 'var(--canvas-100)' }
                        : undefined
                    }
                    onClick={() => setSelectedEmployeeId(pe.id)}
                  >
                    <td className="mono cell-muted">{pe.employee.employeeCode}</td>
                    <td className="cell-primary">
                      {pe.employee.firstName} {pe.employee.lastName}
                    </td>
                    <td className="cell-muted">{pe.employee.position}</td>
                    <td>
                      <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          aria-label="Quitar de la nómina"
                          onClick={() => handleRemoveEmployee(pe)}
                        >
                          <X size={15} color="#b3261e" />
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

      {selectedEmployee && (
        <div className="stack" style={{ gap: 12 }}>
          <span className="section-title" style={{ marginBottom: 0 }}>
            Detalle de {selectedEmployee.employee.firstName} {selectedEmployee.employee.lastName} en esta nómina
          </span>
          <PayrollEmployeePanel
            payrollId={payrollId}
            payrollEmployee={selectedEmployee}
            canEdit={canModifyContent}
          />
        </div>
      )}

      {addModalOpen && (
        <AddEmployeeModal
          excludeEmployeeIds={payrollEmployees.map((pe) => pe.employeeId)}
          onClose={() => setAddModalOpen(false)}
          onAdd={handleAddEmployee}
        />
      )}
      {editModalOpen && (
        <EditPayrollModal payroll={payroll} onClose={() => setEditModalOpen(false)} onSubmit={handleEditPayroll} />
      )}
    </div>
  );
}
