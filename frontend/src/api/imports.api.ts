import { api } from './axios';
import type { ImportEmployeesResult } from '../types/import.types';

export const importsApi = {
  /**
   * POST /imports/employees (multipart/form-data, campo "file").
   * El backend exige que el archivo se llame exactamente
   * "nomina_YYYY-MM.xlsx" y que tenga las hojas Employees, Payroll y
   * Novelties (ver imports.service.ts) — el frontend no valida nada de
   * eso de antemano, solo muestra el mensaje real si el backend lo rechaza.
   */
  importEmployees: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    // Importante: NO fijar Content-Type manualmente aquí. Con FormData el
    // navegador debe generar el boundary del multipart automáticamente;
    // si se fuerza "multipart/form-data" sin boundary, Multer en el
    // backend no puede parsear las partes del archivo. `undefined` borra
    // el "Content-Type: application/json" por defecto de la instancia de
    // Axios y deja que el navegador ponga el header correcto.
    return api
      .post<ImportEmployeesResult>('/imports/employees', formData, {
        headers: { 'Content-Type': undefined },
      })
      .then((res) => res.data);
  },
};
