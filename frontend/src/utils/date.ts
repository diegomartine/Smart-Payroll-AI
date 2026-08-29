const displayFormatter = new Intl.DateTimeFormat('es-CO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Formatea una fecha ISO del backend para mostrarla: "14 ago 2026". */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '—';
  return displayFormatter.format(date);
}

/** Convierte una fecha ISO a "YYYY-MM-DD" para usar en <input type="date">. */
export function toDateInputValue(isoDate: string | null | undefined): string {
  if (!isoDate) return '';
  return isoDate.slice(0, 10);
}
