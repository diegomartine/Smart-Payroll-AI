import { useRef, useState, type DragEvent } from 'react';
import { FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { importsApi } from '../../api/imports.api';
import type { ImportEmployeesResult } from '../../types/import.types';
import { PageHeader } from '../../components/ui/PageHeader';
import { getErrorMessage } from '../../utils/errors';
import { useToast } from '../../hooks/useToast';

export function ImportEmployeesPage() {
  const { showToast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportEmployeesResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const pickFile = (f: File | undefined | null) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setErrorMessage('');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    pickFile(e.dataTransfer.files?.[0]);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);
    setErrorMessage('');
    try {
      const res = await importsApi.importEmployees(file);
      setResult(res);
      showToast('Excel importado correctamente.', 'success');
    } catch (err) {
      const message = getErrorMessage(err);
      setErrorMessage(message);
      showToast(message, 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="stack">
      <PageHeader
        title="Importar nómina"
        description="Sube el Excel de empleados, nómina y novedades de un período."
      />

      <div className="card card-pad" style={{ maxWidth: 620 }}>
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragOver ? 'var(--blue-700)' : 'var(--slate-200)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '36px 20px',
            textAlign: 'center',
            background: dragOver ? 'var(--blue-100)' : 'var(--canvas-100)',
            transition: 'border-color 0.12s ease, background 0.12s ease',
          }}
        >
          <div
            className="empty-state-icon"
            style={{ margin: '0 auto 12px', background: 'var(--surface)' }}
          >
            <FileSpreadsheet size={22} color="var(--navy-800)" />
          </div>
          <p style={{ fontWeight: 600, marginBottom: 4 }}>Arrastra tu archivo Excel aquí</p>
          <p className="text-muted" style={{ fontSize: 12.5, marginBottom: 16 }}>
            o selecciona un archivo · formato requerido:{' '}
            <span className="mono">nomina_YYYY-MM.xlsx</span>
          </p>
          <button type="button" className="btn btn-secondary" onClick={() => inputRef.current?.click()}>
            <Upload size={15} /> Seleccionar archivo
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            hidden
            onChange={(e) => pickFile(e.target.files?.[0])}
          />
        </div>

        {file && (
          <div className="flex-between" style={{ marginTop: 16, fontSize: 13.5 }}>
            <span>
              Archivo: <strong>{file.name}</strong>
            </span>
            <button
              className="btn btn-accent btn-sm"
              onClick={handleImport}
              disabled={importing}
            >
              {importing ? 'Importando…' : 'Importar'}
            </button>
          </div>
        )}

        {errorMessage && (
          <div
            className="flex gap-8"
            style={{
              marginTop: 18,
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--red-100)',
              color: 'var(--red-700)',
              fontSize: 13,
              alignItems: 'flex-start',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {result && (
          <div
            className="stack"
            style={{
              marginTop: 18,
              padding: '16px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--green-100)',
              gap: 10,
            }}
          >
            <div className="flex gap-8" style={{ color: 'var(--green-700)', alignItems: 'center' }}>
              <CheckCircle2 size={17} />
              <strong style={{ fontSize: 13.5 }}>{result.message}</strong>
            </div>
            <div className="mono" style={{ fontSize: 12.5, color: 'var(--ink-900)' }}>
              <div>Archivo: {result.fileName}</div>
              <div>Período: {result.payrollPeriod}</div>
              <div>Empleados importados: {result.employeesImported}</div>
              <div>Registros de nómina: {result.payrollEmployeesImported}</div>
              <div>Novedades importadas: {result.noveltiesImported}</div>
            </div>
          </div>
        )}

        <p className="field-hint" style={{ marginTop: 16 }}>
          El archivo debe tener exactamente las hojas <strong>Employees</strong>,{' '}
          <strong>Payroll</strong> y <strong>Novelties</strong>. Volver a importar el mismo
          período reemplaza las novedades de esos empleados (el Excel es la fuente de verdad).
        </p>
      </div>
    </div>
  );
}
