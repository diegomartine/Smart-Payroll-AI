import { useEffect, useState } from 'react';
import { Download, FileText, X } from 'lucide-react';
import { payslipsApi } from '../../api/payslips.api';
import { pdfApi } from '../../api/pdf.api';
import type { Payslip } from '../../types/payslip.types';
import { Loading } from '../ui/Loading';
import { noveltyTypeLabels, isEarningNovelty, documentTypeLabels } from '../../utils/labels';
import { formatCOP } from '../../utils/currency';
import { getErrorMessage, getBlobErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';

interface PayslipModalProps {
  payrollEmployeeId: number;
  onClose: () => void;
}

export function PayslipModal({ payrollEmployeeId, onClose }: PayslipModalProps) {
  const { showToast } = useToast();
  const [payslip, setPayslip] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [showHtmlBox, setShowHtmlBox] = useState(false);
  const [customHtml, setCustomHtml] = useState('');

  useEffect(() => {
    payslipsApi
      .getByPayrollEmployee(payrollEmployeeId)
      .then(setPayslip)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payrollEmployeeId]);

  const handleDownload = async (useCustomHtml: boolean) => {
    setDownloading(true);
    try {
      await pdfApi.downloadPayslip(
        payrollEmployeeId,
        useCustomHtml && customHtml.trim() ? customHtml : undefined,
      );
    } catch (err) {
      showToast(await getBlobErrorMessage(err), 'error');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" role="dialog" aria-modal="true" aria-label="Desprendible de pago">
        <div className="modal-header">
          <h3>Desprendible de pago</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Cerrar">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <Loading label="Cargando desprendible…" />
          ) : !payslip ? null : (
            <div className="stack" style={{ gap: 18 }}>
              <section>
                <div className="section-title">Información del empleado</div>
                <div className="form-grid" style={{ fontSize: 13 }}>
                  <PayslipField label="Nombre" value={payslip.employee.name} />
                  <PayslipField label="Código" value={payslip.employee.employeeCode} mono />
                  <PayslipField
                    label="Documento"
                    value={`${documentTypeLabels[payslip.employee.documentType]} ${payslip.employee.documentNumber}`}
                  />
                  <PayslipField label="Cargo" value={payslip.employee.position} />
                  <PayslipField label="Departamento" value={payslip.employee.department} />
                  <PayslipField label="Correo" value={payslip.employee.email ?? '—'} />
                </div>
              </section>

              <hr className="divider" style={{ margin: 0 }} />

              <section>
                <div className="section-title">Nómina</div>
                <div className="form-grid" style={{ fontSize: 13 }}>
                  <PayslipField label="Período" value={payslip.period} />
                  <PayslipField label="Días trabajados" value={String(payslip.payroll.workedDays)} />
                  <PayslipField label="Salario base" value={formatCOP(payslip.payroll.baseSalary)} mono />
                  <PayslipField label="Horas extra" value={String(payslip.payroll.overtimeHours)} />
                </div>
              </section>

              <div className="grid-2">
                <section className="card card-pad">
                  <div className="section-title">Devengados</div>
                  <ReceiptLine label="Salario base" value={payslip.earnings.baseSalary} />
                  <ReceiptLine label="Horas extra" value={payslip.earnings.overtimeValue} />
                  <ReceiptLine label="Bonificaciones" value={payslip.earnings.bonus} />
                  <ReceiptLine label="Auxilio de transporte" value={payslip.earnings.transportAllowance} />
                  <ReceiptLine label="Otros ingresos" value={payslip.earnings.otherIncome} />
                  <ReceiptLine
                    label="Novedades (informativo)"
                    value={payslip.earnings.noveltyEarnings}
                    muted
                  />
                </section>

                <section className="card card-pad">
                  <div className="section-title">Deducciones</div>
                  <ReceiptLine label="Salud" value={payslip.deductions.healthDeduction} />
                  <ReceiptLine label="Pensión" value={payslip.deductions.pensionDeduction} />
                  <ReceiptLine label="Otras deducciones" value={payslip.deductions.otherDeductions} />
                  <ReceiptLine
                    label="Novedades (informativo)"
                    value={payslip.deductions.noveltyDeductions}
                    muted
                  />
                </section>
              </div>

              <div className="ledger-receipt">
                <div className="ledger-receipt-title">Totales</div>
                <div className="ledger-row">
                  <span className="ledger-row-label">Total devengado</span>
                  <span className="ledger-row-value">{formatCOP(payslip.totalEarnings)}</span>
                </div>
                <div className="ledger-row">
                  <span className="ledger-row-label">− Total deducciones</span>
                  <span className="ledger-row-value">{formatCOP(payslip.totalDeductions)}</span>
                </div>
                <hr className="ledger-divider" />
                <div className="ledger-total">
                  <span>Neto a pagar</span>
                  <span className="ledger-total-value">{formatCOP(payslip.netPay)}</span>
                </div>
              </div>

              <section>
                <div className="section-title">Novedades</div>
                {payslip.novelties.length === 0 ? (
                  <p className="text-muted" style={{ fontSize: 13 }}>
                    Este empleado no tiene novedades registradas en el período.
                  </p>
                ) : (
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Tipo</th>
                          <th>Descripción</th>
                          <th>Cantidad</th>
                          <th>Valor</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payslip.novelties.map((n) => (
                          <tr key={n.id}>
                            <td>
                              <span className={`badge ${isEarningNovelty(n.type) ? 'badge-green' : 'badge-red'}`}>
                                {noveltyTypeLabels[n.type]}
                              </span>
                            </td>
                            <td className="cell-muted">{n.description ?? '—'}</td>
                            <td className="mono cell-muted">{n.quantity ?? '—'}</td>
                            <td className="mono">{formatCOP(n.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <hr className="divider" style={{ margin: 0 }} />

              <section className="stack" style={{ gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ alignSelf: 'flex-start' }}
                  onClick={() => setShowHtmlBox((v) => !v)}
                >
                  <FileText size={14} />
                  {showHtmlBox ? 'Ocultar plantilla HTML personalizada' : 'Usar plantilla HTML personalizada (avanzado)'}
                </button>
                {showHtmlBox && (
                  <div className="field">
                    <label htmlFor="custom-html">
                      HTML con variables tipo <span className="mono">{'{{employee.name}}'}</span>,{' '}
                      <span className="mono">{'{{period}}'}</span>, <span className="mono">{'{{netPay}}'}</span>
                    </label>
                    <textarea
                      id="custom-html"
                      className="input mono"
                      rows={6}
                      value={customHtml}
                      onChange={(e) => setCustomHtml(e.target.value)}
                      placeholder="<html>...{{employee.name}}...</html>"
                    />
                    <span className="field-hint">
                      El backend reemplaza estas variables antes de convertir el HTML a PDF.
                    </span>
                  </div>
                )}

                <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
                  <button
                    className="btn btn-secondary"
                    disabled={downloading}
                    onClick={() => handleDownload(false)}
                  >
                    <Download size={15} /> Descargar PDF (plantilla estándar)
                  </button>
                  {showHtmlBox && (
                    <button
                      className="btn btn-accent"
                      disabled={downloading || !customHtml.trim()}
                      onClick={() => handleDownload(true)}
                    >
                      <Download size={15} /> Descargar con mi HTML
                    </button>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PayslipField({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="field">
      <label>{label}</label>
      <p className={mono ? 'mono' : ''} style={{ fontSize: 13.5 }}>
        {value}
      </p>
    </div>
  );
}

function ReceiptLine({ label, value, muted }: { label: string; value: number; muted?: boolean }) {
  return (
    <div className="flex-between" style={{ padding: '5px 0', fontSize: 13 }}>
      <span className={muted ? 'text-muted' : ''}>{label}</span>
      <span className={`mono ${muted ? 'text-muted' : ''}`}>{formatCOP(value)}</span>
    </div>
  );
}
