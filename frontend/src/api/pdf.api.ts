import { api } from './axios';
import { downloadBlob, filenameFromContentDisposition } from '../utils/download';

/**
 * El backend YA genera los PDF (pdfkit para la plantilla por defecto,
 * puppeteer cuando se envía un HTML propio). El frontend solo pide el
 * archivo y lo descarga; no genera ni compone PDF en el navegador.
 *
 * Endpoints reales (pdf.controller.ts):
 *   GET  /pdf/payslip/:payrollEmployeeId        -> plantilla por defecto
 *   GET  /pdf/payroll/:payrollId                -> plantilla por defecto
 *   POST /pdf/payslip/:payrollEmployeeId/html    body: { html }
 *   POST /pdf/payroll/:payrollId/html            body: { html }
 *
 * Nota sobre el modo HTML (ver pdf.service.ts):
 * - En el desprendible individual, el backend reemplaza variables tipo
 *   `{{employee.name}}`, `{{period}}`, `{{netPay}}`, etc. (cualquier
 *   ruta dentro del objeto Payslip) antes de convertir a PDF.
 * - En el PDF de nómina completa, el HTML se usa tal cual, SIN reemplazo
 *   de variables — el backend no itera por empleado en ese modo.
 */
export const pdfApi = {
  downloadPayslip: async (payrollEmployeeId: number, html?: string) => {
    const res = html
      ? await api.post(
          `/pdf/payslip/${payrollEmployeeId}/html`,
          { html },
          { responseType: 'blob' },
        )
      : await api.get(`/pdf/payslip/${payrollEmployeeId}`, { responseType: 'blob' });

    const filename = filenameFromContentDisposition(
      res.headers['content-disposition'],
      `desprendible-${payrollEmployeeId}.pdf`,
    );
    downloadBlob(res.data as Blob, filename);
  },

  downloadPayroll: async (payrollId: number, html?: string) => {
    const res = html
      ? await api.post(
          `/pdf/payroll/${payrollId}/html`,
          { html },
          { responseType: 'blob' },
        )
      : await api.get(`/pdf/payroll/${payrollId}`, { responseType: 'blob' });

    const filename = filenameFromContentDisposition(
      res.headers['content-disposition'],
      `nomina-${payrollId}-desprendibles.pdf`,
    );
    downloadBlob(res.data as Blob, filename);
  },
};
