import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../../components/ui/PageHeader";
import { payrollApi } from "../../api/payroll.api";
import { getErrorMessage } from "../../utils/errors";
import { useToast } from "../../hooks/useToast";

interface FormState {
  period: string;
  startDate: string;
  endDate: string;
}

type FieldErrors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.period.trim()) errors.period = "El periodo es obligatorio.";
  if (!form.startDate) errors.startDate = "La fecha inicial es obligatoria.";
  if (!form.endDate) errors.endDate = "La fecha final es obligatoria.";
  if (form.startDate && form.endDate && form.startDate > form.endDate) {
    errors.endDate = "La fecha final debe ser posterior a la fecha inicial.";
  }
  return errors;
}

export function PayrollFormPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [form, setForm] = useState<FormState>({
    period: "",
    startDate: "",
    endDate: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);

  const setField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fieldErrors = validate(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setSaving(true);
    try {
      const created = await payrollApi.create({
        period: form.period.trim(),
        startDate: `${form.startDate}T00:00:00.000Z`,
        endDate: `${form.endDate}T23:59:59.999Z`,
      });
      showToast("Nómina creada correctamente.", "success");
      navigate(`/payroll/${created.id}`);
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="stack">
      <PageHeader
        title="Nueva nómina"
        backTo="/payroll"
        backLabel="Volver a nóminas"
      />

      <form
        className="card card-pad"
        onSubmit={handleSubmit}
        noValidate
        style={{ maxWidth: 520 }}
      >
        <div className="stack" style={{ gap: 18 }}>
          <div className="field">
            <label htmlFor="period">Periodo</label>
            <input
              id="period"
              className={`input ${errors.period ? "has-error" : ""}`}
              value={form.period}
              onChange={(e) => setField("period", e.target.value)}
              placeholder="Ej. Agosto 2026 - Quincena 2"
            />
            {errors.period && (
              <span className="field-error">{errors.period}</span>
            )}
            <span className="field-hint">
              Nombre descriptivo del periodo a procesar.
            </span>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="startDate">Fecha inicial</label>
              <input
                id="startDate"
                type="date"
                className={`input ${errors.startDate ? "has-error" : ""}`}
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
              />
              {errors.startDate && (
                <span className="field-error">{errors.startDate}</span>
              )}
            </div>
            <div className="field">
              <label htmlFor="endDate">Fecha final</label>
              <input
                id="endDate"
                type="date"
                className={`input ${errors.endDate ? "has-error" : ""}`}
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
              />
              {errors.endDate && (
                <span className="field-error">{errors.endDate}</span>
              )}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate("/payroll")}
          >
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Creando…" : "Crear nómina"}
          </button>
        </div>
      </form>
    </div>
  );
}
